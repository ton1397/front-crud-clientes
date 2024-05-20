<template>
  <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-btn flat icon="fas fa-times" class="absolute-top-right z-max" @click.stop.prevent="$emit('changeModal', false)" />
        <q-card-section>
          <div class="text-h6">{{ JSON.stringify(cliente) == '{}' ? 'Adicionar' : 'Editar' }} Cliente</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submit">
            <q-input
              class="input-form"
              outlined
              v-model="nome"
              label="Nome"
              :error-message="v$.nome.$silentErrors[0]?.$message"
              :error="formSubmit && v$.nome.$invalid"
            ></q-input>
            <q-input
              class="input-form"
              mask="#####-###"
              outlined
              v-model="cep"
              label="Cep"
              :error-message="v$.cep.$silentErrors[0]?.$message"
              :error="formSubmit && v$.cep.$invalid"
            ></q-input>
            <q-input
              class="input-form"
              outlined
              v-model="endereco"
              label="Endereco"
              :error-message="v$.endereco.$silentErrors[0]?.$message"
              :error="formSubmit && v$.endereco.$invalid"
            ></q-input>
            <q-select
              class="input-form"
              outlined
              v-model="cidade"
              :options="listaCidades"
              label="Cidade"
              :error-message="v$.cidade.$silentErrors[0]?.$message"
              :error="formSubmit && v$.cidade.$invalid"
            />
            <q-file
              class="input-form"
              color="teal"
              accept=".pdf"
              outlined
              v-model="file"
              label="Arquivo(PDF)"
              clearable
              :error-message="v$.file.$silentErrors[0]?.$message"
              :error="formSubmit && v$.file.$invalid"
              v-if="!changeFile"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
            <iframe :src="fileLink" frameborder="0" v-else></iframe>
            <br>
            <div class="form-actions">
              <q-btn size="md" class="form-actions" rounded outline :label="changeFile ? 'Alterar arquivo' : 'Ver arquivo'" type="button" v-if="JSON.stringify(cliente) != '{}'" @click="changeFile = !changeFile"></q-btn>
            </div>
            <br><br>
            <div class="form-actions">
              <q-btn size="lg" rounded outline :label="JSON.stringify(cliente) == '{}' ? 'Adicionar' : 'Editar'" type="submit" v-if="!processing"></q-btn>
              <q-spinner color="primary" v-else size="3em" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script>
import { useVuelidate } from '@vuelidate/core'
import { helpers, required, maxLength, minLength } from '@vuelidate/validators'
import { useQuasar } from 'quasar'

export default {
  props: {
    showModal: Boolean,
    cliente: Object
  },
  setup () {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      id: '',
      nome: '',
      cep: '',
      endereco: '',
      cidade: '',
      file: null,
      fileLink: null,
      listaCidades: [],
      arquivo: '',
      formSubmit: false,
      processing: false,
      $q: useQuasar(),
      prompt: false,
      showPass: false,
      changeFile: false
    }
  },
  watch: {
    showModal(newVal) {
      console.log(this.cliente);
      if(newVal && JSON.stringify(this.cliente) != '{}') {
        this.id = this.cliente.id
        this.nome = this.cliente.nome
        this.cep = this.cliente.cep.replace(/(\d{5})-?(\d{3})/, '$1-$2');
        this.endereco = this.cliente.endereco
        this.cidade = this.cliente.cidade
        this.fileLink = this.cliente.arquivo
        this.changeFile = true
      }else {
        this.id = ''
        this.nome = ''
        this.cep = ''
        this.endereco = ''
        this.cidade = ''
        this.file = ''
        this.fileLink = ''
        this.changeFile = false
        this.formSubmit = false
      }
      this.prompt = newVal
    },
    cep(newVal) {
      let cep = newVal.replace(/[^0-9]/g, '');
      if(cep.length == 8) {
        this.getCep(cep)
      }else {
        this.endereco = ''
        this.cidade = ''
      }
    }
  },

  validations() {
    return {
      nome: {
        required: helpers.withMessage('* Campo obrigatorio', required)
      },
      cep: {
        required: helpers.withMessage('* Campo obrigatorio', required),
        maxLength: helpers.withMessage('* Cep invalido', maxLength(9)),
        minLength: helpers.withMessage('* Cep invalido', minLength(9))
      },
      endereco: {
        required: helpers.withMessage('* Campo obrigatorio', required)
      },
      cidade: {
        required: helpers.withMessage('* Campo obrigatorio', required)
      },
      file: {
        requiredIfCliente: helpers.withMessage('* Campo obrigatorio', (value) => {
          if(JSON.stringify(this.cliente) == '{}') {
            return value && value != ''
          }
          return true
        })
      },
    }
  },
  methods: {
    setFile(file) {
      this.$http(
        file,
        'GET',
      ).then(res => {
        console.log(res);
      })
    },
    getCep(cep) {
      const api_url = `${process.env.API_VIACEP_URL}/${cep}/json`;
      console.log(api_url);

      this.$http(
        api_url,
        'GET',
      ).then(res => {
        this.endereco = res.logradouro
        this.cidade = res.localidade
        this.getCidades(res.uf)
      }).catch(err => {
        console.log(err)
      })
    },
    getCidades(uf) {
      const api_url = `${process.env.API_IBGE_URL}/${uf}/distritos`;

      this.$http(
        api_url,
        'GET',
      ).then(res => {
        console.log(res);
        this.listaCidades = res.map(cidade => `${cidade.nome}`)
      }).catch(err => {
        console.log(err)
      })
    },
    submit() {
      if(JSON.stringify(this.cliente) == '{}') {
        this.addCliente()
      }else {
        this.updateCliente()
      }
    },
    async addCliente() {
      this.formSubmit = true
      const valid = await this.v$.$validate()

      if (!valid) {
        return
      }

      this.processing = true

      const api_url = process.env.API_URL

      let form = new FormData()

      form.append('nome', this.nome)
      form.append('cep', this.cep.replace(/[^0-9]/g, ''))
      form.append('endereco', this.endereco)
      form.append('cidade', this.cidade)
      form.append('arquivo', this.file)

      this.$http(
        `${api_url}/cliente`,
        'POST',
        {
          'Content-Type': 'multipart/form-data'
        },
        form
      ).then(res => {
        console.log(res)
        this.$q.notify({
          multiline: true,
          color: 'positive',
          message: 'Cliente cadastrado com sucesso.',
          icon: 'fas fa-check-circle',
          position: 'bottom-right'
        })

        this.$emit('changeModal', true)

      }).catch(err => {
        console.log(err)
        this.$q.notify({
          multiline: true,
          color: 'negative',
          message: 'Erro ao cadastrar. Tente novamente mais tarde.',
          icon: 'fas fa-exclamation-triangle',
          position: 'bottom-right'
        })
      }).finally(() => {
        this.processing = false
      })
    },
    async updateCliente() {
      this.formSubmit = true
      const valid = await this.v$.$validate()

      if (!valid) {
        return
      }

      this.processing = true

      const api_url = process.env.API_URL

      let form = new FormData()

      form.append('nome', this.nome)
      form.append('cep', this.cep.replace(/[^0-9]/g, ''))
      form.append('endereco', this.endereco)
      form.append('cidade', this.cidade)

      if(this.file && this.file != '') {
        form.append('arquivo', this.file)
      }else {
        form.append('arquivo', this.fileLink)
      }

      this.$http(
        `${api_url}/cliente/${this.cliente.codigo}`,
        'PUT',
        {
          'Content-Type': 'multipart/form-data'
        },
        form
      ).then(res => {
        console.log(res)
        this.$q.notify({
          multiline: true,
          color: 'positive',
          message: 'Cliente editado com sucesso.',
          icon: 'fas fa-check-circle',
          position: 'bottom-right'
        })

        this.$emit('changeModal', true)

      }).catch(err => {
        console.log(err)
        this.$q.notify({
          multiline: true,
          color: 'negative',
          message: 'Erro ao editar. Tente novamente mais tarde.',
          icon: 'fas fa-exclamation-triangle',
          position: 'bottom-right'
        })
      }).finally(() => {
        this.processing = false
      })

    },

  }
}
</script>

<style scoped>
.input-form {
  margin-bottom: 10px;
}

h3, .form-actions {
  text-align: center;
}
</style>
