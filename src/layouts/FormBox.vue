<template>
  <q-layout class="form-box">
    <q-page-container class="form-box__container">
      <router-view></router-view>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.form-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.form-box__container {
  width: 90%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

@media screen and (max-width: 500px) {
  .form-box__container {
    width: 100%;
    height: 100%;
  }

}
</style>

