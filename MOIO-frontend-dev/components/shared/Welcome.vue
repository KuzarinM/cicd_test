<template>
    <div
    :class="`
    ${hours >= 6 && hours <= 11 ? '--morning' : ''} 
    ${hours > 11 && hours <= 16 ? '--day' : ''}
    ${hours > 16 && hours <= 20 ? '--evening' : ''}
    ${hours > 20 ? '--night' : ''}
    ${hours >= 24 && hours < 6 ? '--night' : ''}
    `"
    >
    
    </div>
</template>

<script setup>

</script>

<style>
.--morning{
  background: linear-gradient(180deg, #6A9AC7 0%, #9AAAD5 45.25%, #E8ADB3 100%)
}
.--day{
  background: linear-gradient(180deg, #8DA8C5 0%, #AFC1CF 22.12%, #CCCECB 45.43%, #DBCBB9 62.15%, #DCC2A8 75.63%, #D3AF97 93.03%, #C29E8F 100%)
}
.--evening{
  background: linear-gradient(180deg, #8CA3B3 0%, #A9B8BF 14.32%, #ACBABF 18.32%, #C4C5BF 32.96%, #E4CEAF 50.16%, #FAD29D 65.51%, #FDCF81 77.91%, #FEBA41 90.63%, #FEA73D 99.85%)
}
.--night{
  background: linear-gradient(126.07deg, #27336F -2.29%, #7968AE 45.16%, #D493B5 94.44%)
}
.dark-opacity{
  width: 100%;
  height: 100%;
  background-color: rgba(28,28,30,0.4)
}
</style>