<template>
    <div class="bv-upload" v-if="!simple">
        <el-upload
            :action="uploadAction"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :before-upload="beforeUploadHandler"
            :accept="accept"
            :limit="limit"
            multiple="multiple"
            :file-list="getFileList"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :on-exceed="handleExceed"
            v-if="isEditFile"
        >
            <el-button size="mini" type="primary" :disabled="isDisabled">上传附件</el-button>
            <div slot="tip" class="bv-upload__tip el-upload__tip">({{ uploadTip }})</div>
        </el-upload>
        <!-- 查看附件 -->
        <el-upload class="bv-upload__detail" :action="uploadAction" :on-preview="handlePreview" :file-list="getFileList" v-else></el-upload>
    </div>
    <div class="bv-upload bv-upload__simple" v-else>
        <el-upload
            :action="uploadAction"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :before-upload="beforeUploadHandler"
            :accept="accept"
            :limit="limit"
            :show-file-list="false"
            multiple="multiple"
            :file-list="getFileList"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :on-exceed="handleExceed"
            v-if="isEditFile"
        >
            <slot name="simple" />
        </el-upload>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { MessageBox, Message } from 'element-ui'
import { services, globalConfig } from '@belvoly-vue-aioa/core'
const { attachmentService } = services

const config = {
    sharedservice: {
        assets: {
            baseURI: `${globalConfig.apiHost}/sharedservice/assets`
        }
    },
    api: {
        baseURI: globalConfig.apiHost
    },
    o365: {
        enabled: false,
        baseURI: '',
        blobURI: '',
        supportFileTypes: ''
    }
}

interface BeforeUpload {
    (file: any): Promise<boolean>
}

interface UploadFile {
    name?: string
    id?: string
    displayName?: string
}

@Component
export default class Index extends Vue {
    @Prop() action: string
    @Prop({ default: 50 }) maxSize: number
    @Prop({ default: true }) multiple: boolean
    @Prop({
        default: function() {
            return []
        }
    })
    fileList: Array<any>
    @Prop({}) refTableName: string
    @Prop({}) typeCode: string
    @Prop() userUid: string
    @Prop({ default: true }) isEditFile: boolean
    @Prop({ default: 9999 }) limit: number
    /**
     * 是否只允许图面
     */
    @Prop({ default: false }) isOnlyImage: boolean

    @Prop({ default: false, type: Boolean }) simple: boolean
    /**
     * 文字提示
     */
    @Prop() tip: string
    /**
     * 上传前验证
     */
    @Prop() beforeUpload: BeforeUpload

    uploadFiles: any[] = []

    get uploadAction() {
        let param = ''
        if (this.refTableName) {
            param += `&refTableName=${this.refTableName}`
        }
        if (this.typeCode) {
            param += `&typeCode=${this.typeCode}`
        }
        if (this.userUid) {
            param += `&creatorID=${this.userUid}`
        }
        return `${this.actionUrl}${this.actionUrl.indexOf('?') === -1 ? '?' : ''}${param}`
    }

    get actionUrl() {
        return this.action || `${config.api.baseURI}/sharedservice/blob/upload`
    }

    get getFileList() {
        const files = this.fileList.map((c: any) => {
            if (c.displayName) {
                c.name = c.displayName
            }
            return c
        })
        return files
    }
    get accept() {
        if (this.isOnlyImage) {
            return '.jpg,.jpeg,.png,.bmp'
        }
        return ''
    }
    get uploadTip() {
        return this.tip || this.isOnlyImage ? `最多允许上传${this.maxSize}MB的内容，格式仅支持${this.accept}` : `最多允许上传${this.maxSize}MB的内容`
    }

    get isDisabled() {
        return this.uploadFiles.length >= this.limit
    }

    mounted() {
        this.watchFileList(this.fileList)
    }

    @Watch('fileList')
    watchFileList(newValue) {
        this.uploadFiles = [...newValue]
    }
    @Watch('uploadFiles')
    watchUploadFiles(newValue) {
        this.replaceFileIcons(newValue)
    }

    handlePreview(file) {
        if (file.id) {
            this.handlePreviewCore(file)
        } else {
            window.open(file.response.data.url)
        }
    }
    handlePreviewCore(file) {
        const preivewEnabled = config.o365.enabled

        if (preivewEnabled) {
            this.handleO365Preview(file)
        } else {
            window.open(file.url)
        }
    }
    handleO365Preview(file) {
        let url = file.url

        if (file.extension && this.checkO365PreviewSupproted(file.extension)) {
            url = `${config.o365.baseURI}${config.o365.blobURI}/${file.id}`
        }

        window.open(url)
    }
    checkO365PreviewSupproted(extension) {
        const supportFileTypes = config.o365.supportFileTypes

        return supportFileTypes.includes(extension)
    }

    async handleExceed(files, fileList) {
        Message.warning(`当前限制选择 ${this.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    }

    async handleRemove(file) {
        if (!(file.id || file.response)) {
            return true
        }
        const id = file.id || file.response.data.id

        const { success } = await attachmentService.remove(id)

        if (success) {
            Message({
                message: '删除附件成功',
                type: 'success'
            })

            const fileIndex = this.uploadFiles.findIndex(file => file.id === id)
            if (fileIndex > -1) {
                this.uploadFiles.splice(fileIndex, 1)
            }
        }
        this.change()
    }
    async beforeRemove(file) {
        if (file.status === 'ready') {
            return true
        }
        return await MessageBox.confirm(`确定移除 ${file.name}？`)
    }

    handleUploadSuccess(response, file, fileList) {
        const responseData: UploadFile = response.data

        const successFiles = fileList.find(file => file.status === 'success')

        if (responseData) {
            this.uploadFiles.push(responseData)
        }

        if (successFiles.length < fileList.length) {
            return
        }

        const uploadInfo = {
            ids: fileList.map(file => file.id || file.response.data?.id),
            refTableId: '',
            refTableName: this.refTableName,
            file: file,
            fileList: fileList
        }

        this.$emit('on-success', uploadInfo)
        this.$emit('success', uploadInfo, responseData)
        this.change()
    }

    handleUploadError(err, file) {
        this.$emit('error', err, file)
    }

    handleUploadProgress(event, file) {
        this.$emit('uploading', event, file)
    }

    change() {
        const files = this.uploadFiles.map(f => {
            return {
                id: f.id,
                data: f
            }
        })
        this.$emit('change', files)
    }

    async beforeUploadHandler(file) {
        const before = this.beforeUpload || (this.isOnlyImage && this.beforeUploadImage)
        if (before) {
            try {
                await before(file)
            } catch (e) {
                this.$message.error(e.message)
                throw new Error(e.message)
            }
        }
        const isLtSize = file.size / 1024 / 1024 < this.maxSize
        if (!isLtSize) {
            const message = `上传文件大小不能超过 ${this.maxSize}MB!`
            this.$message.error(message)
            throw new Error(message)
        }
    }

    async beforeUploadImage(file) {
        const allowTypes = ['image/bmp', 'image/jpeg', 'image/png']

        if (allowTypes.some(c => c === file.type)) {
            return true
        }

        throw new Error(`图片格式不正确`)
    }

    replaceFileIcons(files) {
        this.$nextTick(() => {
            this.$el.querySelectorAll('.el-icon-document').forEach((el: HTMLElement, i) => {
                el.style.display = 'none'

                if (i >= files.length) {
                    return
                }

                this.showFileIcon(el, files[i])
            })
            // 查看模式下才显示
            if (!this.isEditFile) {
                this.$el.querySelectorAll('.el-upload-list__item-status-label').forEach((el: HTMLElement, i) => {
                    el.style.display = 'none'

                    if (i >= files.length) {
                        return
                    }
                    // 添加下载和预览按钮
                    this.addDownloadIcon(el, files[i])
                })
            }
        })
    }
    addDownloadIcon(el: HTMLElement, file) {
        let isView = false
        const url = file.url
        let urlv = ''
        if (file.extension && this.checkO365PreviewSupproted(file.extension)) {
            urlv = `${config.o365.baseURI}${config.o365.blobURI}/${file.id}`
            isView = true
        }

        if (isView) {
            const viewNode = document.createElement('span')
            viewNode.title = '查看'
            viewNode.addEventListener('click', function() {
                window.open(urlv)
            })
            viewNode.style.cursor = 'pointer'
            viewNode.style.position = 'absolute'
            viewNode.style.right = '18px'
            viewNode.style.top = '0'

            const iNode = document.createElement('i')
            iNode.className = 'fc fc-eyes-open'
            viewNode.prepend(iNode)

            el.parentNode.insertBefore(viewNode, el)

            el.style.right = '35px'
        } else {
            el.style.right = '19px'
        }

        const downloadElement = document.createElement('span')
        downloadElement.className = 'bv-upload-list__item-download'
        downloadElement.title = '下载'
        downloadElement.addEventListener('click', function() {
            window.open(url)
        })

        const iNode = document.createElement('i')
        iNode.className = 'fc fc-next-one'
        downloadElement.prepend(iNode)
        el.parentNode.insertBefore(downloadElement, el)
    }
    showFileIcon(el: HTMLElement, file) {
        let extension = file.extension
        if (!extension) {
            const names = file.name.split('.')
            if (names.length > 1) {
                extension = '.' + names.pop()
            }
        }
        if (!extension) {
            return
        }
        const element = el.parentNode.querySelector('.el-upload-file-icon')
        if (element) {
            return
        }
        const removedDotExtension = extension.substring(1)
        const assertBaseURI = `${config.sharedservice.assets.baseURI}/img/files`
        const iconUrl = `${assertBaseURI}/${removedDotExtension}.png`
        const errorUrl = `${assertBaseURI}/default.png`
        // el.previousSibling.parentElement.remove()

        const imgElement = document.createElement('img')
        imgElement.className = 'el-upload-file-icon'
        imgElement.src = iconUrl
        imgElement.alt = extension
        imgElement.addEventListener('error', function() {
            imgElement.src = errorUrl
        })

        el.parentNode.insertBefore(imgElement, el)
    }
    /**
     * 更新关联业务表记录ID
     */
    updateRelevance(refTableID) {
        const blobRelevance = {
            ids: this.uploadFiles.map(file => file.id),
            refTableName: this.refTableName,
            refTableID: refTableID
        }
        return attachmentService.updateRelevance(blobRelevance)
    }
}
</script>
<style lang="less">
.bv-upload {
    &__tip {
        margin-left: 10px;
        display: inline-block;
    }

    &__simple {
        display: inline-block;
    }
    .el-upload-list__item {
        .el-upload-list__item-name {
            display: inline-block;
            vertical-align: middle;
            color: #333;
            margin-right: 20px;

            width: auto;

            .el-upload-file-icon {
                width: 26px;
                height: 26px;
                vertical-align: middle;
                margin-right: 7px;
            }
        }
        .el-upload-list__item-status-label {
            display: inline-block;
        }
        .bv-upload-list__item-download,
        .el-upload-list__item-status-label,
        .el-icon-close {
            position: static;
            vertical-align: middle;
            margin-right: 7px;
            color: #999;
        }

        &:hover {
            background-color: transparent;
            .el-icon-close {
                display: inline-block;
            }
        }
    }
}
.bv-upload__detail {
    clear: both;
    .el-upload--text {
        display: none !important;
    }
    .el-upload-list__item {
        line-height: 26px;
        &:hover {
            background-color: transparent;
            .el-icon-close,
            .el-icon-close-tip {
                display: none;
            }
        }
        .el-icon-close-tip {
            display: none !important;
        }

        .el-upload-list__item-name {
            display: inline-block;
            vertical-align: middle;
            color: #333;
            margin-right: 20px;

            width: auto;

            .el-upload-file-icon {
                width: 26px;
                height: 26px;
                vertical-align: middle;
                margin-right: 7px;
            }
        }
    }
}

.bv-upload-list__item-download {
    // position: absolute;
    // right: 1px;
    top: 0;
    cursor: pointer;

    display: inline-block;
    vertical-align: middle;
}
</style>
