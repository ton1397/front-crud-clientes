<template>
  <q-page-container>
    <h3>Lista de Clientes</h3>
    <div class="add-user">
      <q-btn
        rounded
        color="primary"
        icon="fas fa-plus"
        label="Adicionar Usuário"
        @click="adicionarUsuario"
      />
    </div>
    <q-markup-table v-if="!processing">
      <thead>
        <tr>
          <th class="text-left">Nome</th>
          <th class="text-left">Cep</th>
          <th class="text-left">Endereco</th>
          <th class="text-left">Cidade</th>
          <th class="text-left">Arquivo</th>
          <th class="text-left">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="listaClientes.length === 0">
          <td colspan="6" style="font-size: 1.3em; text-align: center">
            <strong>
              Não há clientes para exibir.
            </strong>
          </td>
        </tr>
        <tr class="table-row" v-for="item in listaClientes" :key="item.id" @dblclick="editarCliente(item)">
          <td>{{ item.nome }}</td>
          <td>{{ item.cep }}</td>
          <td>{{ item.endereco }}</td>
          <td>{{ item.cidade }}</td>
          <td>
            <a :href="item.arquivo" target="_blank">Ver arquivo</a>
          </td>
          <td>
            <q-btn-dropdown flat rounded color="primary" dropdown-icon="fas fa-ellipsis-v" size="1em">
              <q-list>
                <q-item clickable @click="excluirCliente(item.codigo)">
                  <q-item-section side>
                    <q-icon name="fas fa-trash" color="negative" size="xs" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Deletar</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <div class="loading-spinner" v-else>

      <q-spinner size="3em" color="primary" />
    </div>
  </q-page-container>
  <cliente-modal :showModal="prompt" :cliente="modalProps" @changeModal="changeModal"/>

</template>
<script>
import clienteModal from '../components/ClienteModal.vue'
import { useQuasar } from 'quasar'
export default {
  components: { clienteModal },
  data() {
    return {
      listaClientes: [],
      processing: false,
      modalProps: {},
      prompt: false,
      $q: useQuasar(),

      columns: [
        { name: 'codigo', label: 'ID', field: 'id' },
        { name: 'nome', label: 'Nome', field: 'nome' },
        { name: 'cep', label: 'Cep', field: 'cep' },
        { name: 'endereco', label: 'Endereco', field: 'endereco' },
        { name: 'cidade', label: 'Cidade', field: 'cidade' },
        { name: 'arquivo', label: 'Arquivo', field: 'arquivo' },
        { name: 'acoes', label: 'Ações', field: 'acao' },
    ]
    };
  },
  created() {
    this.getClientes();
  },
  methods: {
    getClientes() {

      const api_url = process.env.API_URL

      this.$http(
        `${api_url}/cliente`,
        'GET',
      ).then(res => {
        console.log(res);
        this.listaClientes = res
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        this.processing = false
      })
    },
    adicionarUsuario() {
      this.prompt = true
    },
    editarCliente(cliente) {
      // console.log(user);
      this.modalProps = cliente
      this.prompt = true
    },
    excluirCliente(id) {
      this.$q.notify({
        color: 'dark',
        message: 'Deseja realmente excluir este cliente?',
        icon: 'fas fa-question-circle',
        position: 'center',
        timeout: 0,
        actions: [
          {
            label: 'Cancelar',
            color: 'negative',
            handler: () => {
              console.log('Cancel')
            }
          },
          {
            label: 'Confirmar',
            color: 'positive',
            handler: () => {
              this.processing = true

              const api_url = process.env.API_URL

              this.$http(
                `${api_url}/cliente/${id}`,
                'DELETE'
              ).then(res => {
                console.log(res)
                this.$q.notify({
                  color: 'positive',
                  message: 'Excluido com sucesso.'
                })
                this.refreshCliente()
              }).catch(err => {
                console.log(err)
              }).finally(() => {
                this.processing = false
              })
            }
          }
        ]
      })
    },
    changeModal(refresh) {
      this.prompt = !this.prompt
      this.modalProps = {}
      if (refresh) {
        this.refreshCliente()
      }
    },
    refreshCliente() {
      this.userList = []
      this.processing = true
      this.getClientes()
    }
  }
};
</script>

<style scoped>
h3, .loading-spinner {
  text-align: center;
}

.add-user {
  text-align: end;
  margin-bottom: 10px;
}

.table-row:hover {
  cursor: pointer;
}
</style>
