<template>
    <div class="bvan-mui-upload margin-small-top">
        <bvan-cell :title="label" :border="false">
            <template #right-icon>
                <bvan-uploader v-if="!isReadonly && !isDisabled" :before-read="beforeReadHandler" :after-read="afterReadHandler" multiple="multiple">
                    <bvan-icon name="attachment" class-prefix="fc" color="#999" style="line-height: inherit;" />
                </bvan-uploader>
            </template>
        </bvan-cell>
        <bvan-cell-group class="margin-small-bottom" v-if="files.length > 0">
            <div class="bvan-mui-upload__items">
                <dl v-for="(item, index) in files" :key="index" class="bvan-mui-upload__item">
                    <dt>
                        <span style="background: green;">X</span>
                        <strong>
                            <span>{{ item.file.name }}</span>
                        </strong>
                        <!-- <em>测试.xlxs</em> -->
                    </dt>
                    <dd>
                        <bvan-loading v-if="item.status === 'uploading'" size="14px">上传中...</bvan-loading>
                        <template v-else-if="item.status === 'failed'">
                            <bvan-tag type="danger">上传失败</bvan-tag>
                            <span v-if="!isReadonly" class="bvan-mui-upload__button" @click="removeHandler(item.file)">
                                <bvan-icon name="delete" class-prefix="fc" style="line-height: inherit;" />
                                删除
                            </span>
                        </template>
                        <template v-else>
                            <span class="bvan-mui-upload__button" @click="handlePreview(item.file)">
                                <bvan-icon name="eyes-open" class-prefix="fc" style="line-height: inherit;" />
                                查看
                            </span>
                            <span v-if="!isReadonly" class="bvan-mui-upload__button" @click="removeHandler(item.file)">
                                <bvan-icon name="delete" class-prefix="fc" style="line-height: inherit;" />
                                删除
                            </span>
                            <!-- <span class="bvan-mui-upload__button">
                                <bvan-icon name="cloud-download" class-prefix="fc" style="line-height: inherit;" />
                                下载
                            </span>
                            <span class="bvan-mui-upload__button">
                                <bvan-icon name="write-mail" class-prefix="fc" style="line-height: inherit;" />
                                编辑
                            </span> -->
                        </template>
                    </dd>
                </dl>
                <!-- <dl class="bvan-mui-upload__item">
                    <dt>
                        <span style="background: green;">X</span>
                        <strong>
                            <span>
                                软件测试软件测试软件测试软件测试软件测试软件
                            </span>
                        </strong>
                        <em>测试.xlxs</em>
                    </dt>
                    <dd>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="eyes-open" class-prefix="fc" style="line-height: inherit;" />
                            查看
                        </span>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="cloud-download" class-prefix="fc" style="line-height: inherit;" />
                            下载
                        </span>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="write-mail" class-prefix="fc" style="line-height: inherit;" />
                            编辑
                        </span>
                    </dd>
                </dl>
                <dl class="bvan-mui-upload__item">
                    <dt>
                        <span>W</span>
                        <strong>软件测试软件测试软件测试软件测试软件测试软件</strong>
                        <em>测试.docx</em>
                    </dt>
                    <dd>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="eyes-open" class-prefix="fc" style="line-height: inherit;" />
                            查看
                        </span>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="cloud-download" class-prefix="fc" style="line-height: inherit;" />
                            下载
                        </span>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="write-mail" class-prefix="fc" style="line-height: inherit;" />
                            编辑
                        </span>
                    </dd>
                </dl>
                <dl class="bvan-mui-upload__item">
                    <dt>
                        <span style="background: orange;">P</span>
                        <strong>软件测试软件测试软件测试软件测试软件测试软件</strong>
                        <em>测试.pptx</em>
                    </dt>
                    <dd>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="eyes-open" class-prefix="fc" style="line-height: inherit;" />
                            查看
                        </span>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="cloud-download" class-prefix="fc" style="line-height: inherit;" />
                            下载
                        </span>
                        <span class="bvan-mui-upload__button">
                            <bvan-icon name="write-mail" class-prefix="fc" style="line-height: inherit;" />
                            编辑
                        </span>
                    </dd>
                </dl> -->
            </div>
        </bvan-cell-group>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Notify, Dialog } from '@belvoly-vue-aioa/bvant'
import { utils, globalConfig, services } from '@belvoly-vue-aioa/m-core'
const { attachmentService } = services
const { request } = utils

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

@Component
export default class Index extends Vue {
    @Prop({ default: '附件' }) label: string
    @Prop({ default: `${config.api.baseURI}/sharedservice/blob/upload` }) action: string
    @Prop({ default: true }) multiple: boolean
    @Prop({
        default: function() {
            return []
        }
    })
    fileList: Array<any>

    @Prop({ required: true }) refTableName: string
    @Prop({ required: true }) typeCode: string
    @Prop() userUid: string
    @Prop({ default: false }) readonly: boolean

    /**
     * 文字提示
     */
    @Prop() tip: string

    @Prop({ default: 50 }) maxSize: number
    /**
     * 是否只允许图片
     */
    @Prop({ default: false }) isOnlyImage: boolean
    /**
     * 上传前验证
     */
    @Prop() beforeUpload: BeforeUpload

    @Prop({ default: 9999 }) limit: number

    uploadFiles: any[] = []
    files: any[] = []

    get getFileList() {
        const files = this.fileList.map((c: any) => {
            if (c.displayName) {
                c.name = c.displayName
            }

            return {
                status: 'success',
                file: c
            }
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

    get isReadonly() {
        return !(this.readonly === false)
    }

    get isDisabled() {
        return this.uploadFiles.length >= this.limit
    }

    get uploadAction() {
        return `${this.action}?refTableName=${this.refTableName}&typeCode=${this.typeCode}&creatorID=${this.userUid}`
    }

    mounted() {
        this.watchFileList(this.fileList)
    }

    @Watch('fileList')
    watchFileList(newValue) {
        this.files = this.getFileList
        this.uploadFiles = [...newValue]
    }

    async beforeReadHandler(file) {
        const before = this.beforeUpload || (this.isOnlyImage && this.beforeUploadImage)
        if (before) {
            try {
                await before(file)
            } catch (e) {
                Notify({ type: 'danger', message: e.message })
                throw new Error(e.message)
            }
        }
        const isLtSize = file.size / 1024 / 1024 < this.maxSize
        if (!isLtSize) {
            const message = `上传文件大小不能超过 ${this.maxSize}MB!`
            Notify({ type: 'danger', message: message })

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

    async afterReadHandler(file) {
        //
        if (file instanceof Array) {
            file.forEach((item, index) => {
                this.uploadFile(item.file)
            })
        } else {
            this.uploadFile(file.file)
        }
    }

    async uploadFile(file) {
        const item = {
            file: file,
            status: 'uploading'
        }
        this.files.push(item)
        const data = new FormData()
        data.append(`file`, file)

        //192.168.101.135:2001/api/sharedservice/blob/5f94345a-009f-46ab-8c48-dabcc68b9841
        const { data: result, success } = await request.request(this.uploadAction, {
            headers: {
                //添加请求头
                'Content-Type': 'multipart/form-data'
            },
            method: 'POST',
            data: data
        })
        if (success) {
            file.response = { data: result }

            item.status = 'success'
            this.handleUploadSuccess(result, file, this.files)
        } else {
            item.status = 'failed'
        }
        console.log(this.files)
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

    async removeHandler(file) {
        this.beforeRemove(file)
            .then(() => {
                this.handleRemove(file)
            })
            .catch(function() {
                //
            })
    }

    async handleRemove(file) {
        const fi = this.files.findIndex(f => f === file)
        this.files.splice(fi, 1)

        if (!(file.id || file.response)) {
            return true
        }
        const id = file.id || file.response.data.id

        const { success } = await attachmentService.remove(id)

        if (success) {
            Notify({
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
        return await Dialog.confirm({ title: `确定移除 ${file.name}？` })
    }

    handleUploadSuccess(responseData, file, fileList) {
        this.uploadFiles.push(responseData)
        const successFiles = fileList.find(file => file.status === 'success')

        if (successFiles.length < fileList.length) {
            return
        }

        const uploadInfo = {
            ids: this.uploadFiles.map(file => file.id || file.response.data.id),
            refTableId: '',
            refTableName: this.refTableName,
            file: file,
            fileList: fileList
        }

        this.$emit('on-success', uploadInfo)
        this.change()
        // this.$bus.emit('uploadInfo', uploadInfo)
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
.bvan-mui-upload {
    &__items {
        padding: 16px;
    }
    &__item {
        padding-bottom: 16px;
        &:last-of-type {
            padding-bottom: 0;
        }
        dt {
            line-height: 24px;
            display: flex;
            white-space: nowrap;
            padding-bottom: 8px;
            > span {
                width: 24px;
                height: 24px;
                background: #3492e9;
                text-align: center;
                margin-right: 8px;
                color: #ffffff;
                font-size: 12px;
            }
            strong {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: normal;
            }
            em {
                display: block;
                // width: 42px;
                overflow: hidden;
                text-align: right;
                font-style: normal;
            }
        }
    }
    &__button {
        color: #999;
        margin-right: 16px;
        > i {
            margin-right: 4px;
        }
    }
}
</style>