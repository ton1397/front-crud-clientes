import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    counter: 0,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    requiredValidation(value: string) {

      return new Promise((resolve) => {
        if (!value || value === '') {
          resolve('* Campo obrigatório');
        }else{
          resolve(true);
        }
      })
    },
    emailValidation(value: string) {
      return new Promise((resolve) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          resolve('* Email inválido');
        } else {
          resolve(true);
        }
      })
    }
  },
});
