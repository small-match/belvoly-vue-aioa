<template>
    <div style="text-align: left">
        <el-form>
            <el-form-item label="封面">
                <upload
                    :action="actionUrl"
                    :limit="1"
                    :isOnlyImage="true"
                    :fileList="imageList"
                    :refTableName="refTableName"
                    :typeCode="typeCode"
                    tip="封面仅支持20MB以下图片，格式仅支持.jpg ,jpeg .png .bmp"
                />
            </el-form-item>
            <el-form-item label="附件">
                <upload ref="upload" :action="actionUrl" :limit="3" :fileList="fileList" :typeCode="typeCode" :refTableName="refTableName" :isEditFile="false" @change="changeHandler" />
            </el-form-item>
        </el-form>
        <div>
            简易模式：
            <upload simple @success="simpleSuccessHandler" @error="simpleErrorHandler" action="http://192.168.101.135:2001/api/bua/avatar/uploadHeadPhoto?userUid=luolong">
                <template #simple>
                    <el-button size="mini" type="primary" native-type="button">上传</el-button>
                </template>
            </upload>
            （格式.pdf）
        </div>
        <el-button @click="saveHandler" :loading="loading">
            保存
        </el-button>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// import { Upload } from '../../packages/ui'
import Upload from '../../../packages/ui/packages/upload/Index.vue'
@Component({
    components: {
        Upload
    }
})
export default class UploadIndex extends Vue {
    actionUrl = `http://192.168.101.135:2001/api/sharedservice/blob/upload`
    typeCode = 'demo'
    refTableName = 'FRONTEND_TEST'
    fileList = [
        {
            id: '30cfe4ac-6635-4bff-8bae-721c3247605a',
            refTableID: '302df60ca8a94cfe8d7cc1f7b64c0d45',
            refTableName: 'CALENDAR_MYCALENDAR',
            displayName: '155058843.jpg',
            persistentType: 0,
            contentType: 'image/jpeg',
            name: '155058843',
            extension: '.jpg',
            content: null,
            length: 23100,
            relativePath: 'CALENDAR_MYCALENDAR\\20200331',
            internalName: '8c4d33f1-c92b-4306-9332-d1c357c7ec7b.jpg',
            typeCode: null,
            isDelete: 0,
            extraData: null,
            sequence: 0,
            creatorID: 'xiejianyun',
            creatorName: '谢建云',
            createTime: '2020-03-31 16:51:53',
            updateTime: '2020-03-31 16:51:53',
            url: 'http://192.168.101.135:2001/api/sharedservice/blob/30cfe4ac-6635-4bff-8bae-721c3247605a',
            downTimes: 0
        },
        {
            id: 'f3880c0f-e022-4523-98c8-535fe84beb4e',
            refTableID: '302df60ca8a94cfe8d7cc1f7b64c0d45',
            refTableName: 'CALENDAR_MYCALENDAR',
            displayName: '155058843.jpg',
            persistentType: 0,
            contentType: 'image/jpeg',
            name: '155058843',
            extension: '.jpg',
            content: null,
            length: 23100,
            relativePath: 'CALENDAR_MYCALENDAR\\20200331',
            internalName: '6599bbb1-2180-4fde-9aae-fda56bb2106f.jpg',
            typeCode: null,
            isDelete: 0,
            extraData: null,
            sequence: 0,
            creatorID: 'xiejianyun',
            creatorName: '谢建云',
            createTime: '2020-03-31 16:52:14',
            updateTime: '2020-03-31 16:52:14',
            url: 'http://192.168.101.135:2001/api/sharedservice/blob/f3880c0f-e022-4523-98c8-535fe84beb4e',
            downTimes: 0
        },
        {
            id: 'f6b80c23-41d2-42f1-8743-75f4190d123f',
            refTableID: '302df60ca8a94cfe8d7cc1f7b64c0d45',
            refTableName: 'CALENDAR_MYCALENDAR',
            displayName: '155058843.jpg',
            persistentType: 0,
            contentType: 'image/jpeg',
            name: '155058843',
            extension: '.jpg',
            content: null,
            length: 190124,
            relativePath: 'CALENDAR_MYCALENDAR\\20200331',
            internalName: '39d675c8-85ca-4683-a03b-f3fa3c0498d1.jpg',
            typeCode: 'undefined',
            isDelete: 0,
            extraData: null,
            sequence: 0,
            creatorID: 'xiejianyun',
            creatorName: null,
            createTime: '2020-03-31 17:15:02',
            updateTime: '2020-03-31 17:15:02',
            url: 'http://192.168.101.135:2001/api/sharedservice/blob/f6b80c23-41d2-42f1-8743-75f4190d123f',
            downTimes: 0
        }
    ]

    imageList = []

    changeHandler(files) {
        console.log('change', files)
    }

    loading = false

    async saveHandler() {
        const id = 'XXX-XXX-XX'
        const upload: any = this.$refs.upload
        this.loading = true
        await upload.updateRelevance(id)
        this.loading = false
    }

    async simpleSuccessHandler(info, responseData) {
        console.log(info, responseData, 'simple success')
        alert('上传成功')
    }

    async simpleErrorHandler() {
        alert('上传失败')
    }
}
</script>
