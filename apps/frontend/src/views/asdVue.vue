<template>
    <form>
  <p>Click on the text box and choose any option suggested by your browser.</p>

  <label for="name">Name</label>
  <input id="name" name="name" type="text" autocomplete="name" @animationstart="handleAutofill" />

  <label for="email">Email Address</label>
  <input id="email" name="email" type="email" autocomplete="email" @animationstart="handleAutofill" />

  <label for="country">Country</label>
  <input id="country" name="country" type="text" autocomplete="country-name" @animationstart="handleAutofill" />
</form>
  </template>
  
  <script setup lang="ts">

  

  
  const handleAutofill = (event: AnimationEvent) => {
    console.log("autofill");
    const target = event.target as HTMLInputElement;
    if (event.animationName === "autofill-fix" && target) {
      target.style.backgroundColor = "#000000";
      target.style.color = "#000000";
    }
  };
  </script>
  <style scoped>

@keyframes autofill-fix {
  0% { background: transparent; }
  100% { background: transparent; }
}

input:-webkit-autofill {
  animation-name: autofill-fix;
  animation-duration: 1s;
}

input{
    background-color: #000000;
    color: #ffffff;
}

</style>
  