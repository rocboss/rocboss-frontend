<template>
    <no-ssr>
        <video-player class="video-player-box"
            ref="videoPlayer"
            :options="{
                fluid: true,
                preload: 'auto',
                language: 'en',
                playbackRates: [0.5, 1.0, 1.5, 2.0],
                sources: [{
                    type: 'video/mp4',
                    src: url
                }]
            }"
            :playsinline="true">
        </video-player>
    </no-ssr>
</template>

<script>
import Vue from 'vue'
import 'video.js/dist/video-js.css'

// No SSR
if (process.browser) {
    Vue.use(require('vue-video-player'))
}

export default {
    props: {
        url: String
    }
}
</script>

<style lang="less" scoped>

</style>


