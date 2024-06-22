<template>
  <div class="container mt-5">
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <h2 class="mt-5">Lista de Tareas Pendientes</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Estado</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in pendingTasks" :key="task.id">
          <td>{{ task.title }}</td>
          <td>
            <input type="checkbox" v-model="task.completed" @change="updateTask(task)">
            <span v-if="task.completed" class="text-success">Completada</span>
            <span v-else class="text-danger">Pendiente</span>
          </td>
          <td>
            <button class="btn btn-danger btn-sm" @click="cancelTask(task.id)">Cancelar</button>
          </td>
        </tr>
        <tr v-if="pendingTasks.length === 0">
          <td colspan="3" class="text-center">No hay tareas pendientes.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="mt-5">Tareas Completadas</h2>
    <table class="table" v-if="completedTasks.length > 0">
      <thead>
        <tr>
          <th scope="col">Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in completedTasks" :key="task.id">
          <td>{{ task.title }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay tareas completadas.</p>

    <h2 class="mt-5">Historial de Tareas Canceladas</h2>
    <table class="table" v-if="canceledTasks.length > 0">
      <thead>
        <tr>
          <th scope="col">Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in canceledTasks" :key="task.id">
          <td>{{ task.title }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay tareas canceladas.</p>
  </div>

  <div class="container mt-5">
    <h2 class="mt-5">Agregar Nota Personal</h2>
    <form @submit.prevent="addNote">
      <div class="form-group">
        <label for="noteName">Nombre</label>
        <input type="text" class="form-control" id="noteName" v-model="noteName">
        <div v-if="errors.noteName" class="alert alert-danger">{{ errors.noteName }}</div>
      </div>
      <div class="form-group">
        <label for="noteMessage">Mensaje</label>
        <textarea class="form-control" id="noteMessage" v-model="noteMessage"></textarea>
        <div v-if="errors.noteMessage" class="alert alert-danger">{{ errors.noteMessage }}</div>
      </div>
      <button type="submit" class="btn btn-primary">Agregar Nota</button>
    </form>

    <h2 class="mt-5">Notas Personales</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Mensaje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(note, index) in personalNotes" :key="index">
          <td>{{ note.name }}</td>
          <td>{{ note.message }}</td>
        </tr>
        <tr v-if="personalNotes.length === 0">
          <td colspan="2" class="text-center">No hay notas personales.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const tasks = ref([]);
    const canceledTasks = ref([]);
    const completedTasks = ref([]);
    const personalNotes = ref([]);
    const error = ref(null);
    const taskName = ref('');
    const noteName = ref('');
    const noteMessage = ref('');
    const errors = ref({});

    const fetchTasks = async () => {
      try {
        await store.dispatch('fetchTasks');
        tasks.value = store.state.tasks;
        completedTasks.value = store.getters.completedTasks.filter(task => !task.completed);
      } catch (err) {
        error.value = err.message;
      }
    };

    const validateAndAddTask = async () => {
      if (validateForm()) {
        await addTask();
        clearForm();
      }
    };

    const validateForm = () => {
      let isValid = true;
      errors.value = {};

      if (taskName.value.trim().split(' ').length < 3) {
        errors.value.taskName = 'La tarea debe tener al menos 3 palabras.';
        isValid = false;
      }

      return isValid;
    };

    const addTask = async () => {
      const taskData = {
        title: taskName.value,
        completed: false
      };
      try {
        const response = await store.dispatch('addTask', taskData);
        tasks.value.push(response);
      } catch (err) {
        error.value = err.message;
      }
    };

    const cancelTask = async (taskId) => {
      try {
        const taskToCancel = tasks.value.find(task => task.id === taskId);
        canceledTasks.value.push(taskToCancel);
        await store.dispatch('deleteTask', taskId);
        tasks.value = tasks.value.filter(task => task.id !== taskId);
      } catch (err) {
        error.value = err.message;
      }
    };

    const updateTask = async (task) => {
      try {
        await store.dispatch('updateTask', task);
        if (task.completed) {
          completedTasks.value.push(task);
        } else {
          completedTasks.value = completedTasks.value.filter(t => t.id !== task.id);
        }
      } catch (err) {
        error.value = err.message;
      }
    };

    const clearForm = () => {
      taskName.value = '';
      errors.value = {};
    };

    const addNote = () => {
      if (validateNoteForm()) {
        const newNote = {
          name: noteName.value,
          message: noteMessage.value
        };
        personalNotes.value.push(newNote);
        clearNoteForm();
      }
    };

    const validateNoteForm = () => {
      let isValid = true;
      errors.value = {};

      if (noteName.value.trim().split(' ').length < 2) {
        errors.value.noteName = 'El nombre de la nota debe tener al menos 2 palabras.';
        isValid = false;
      }

      if (noteMessage.value.trim().length < 30) {
        errors.value.noteMessage = 'El mensaje de la nota debe tener al menos 30 caracteres.';
        isValid = false;
      }

      return isValid;
    };

    const clearNoteForm = () => {
      noteName.value = '';
      noteMessage.value = '';
    };

    onMounted(fetchTasks);

    const pendingTasks = computed(() => tasks.value.filter(task => !task.completed));
    const completedTasksCount = computed(() => completedTasks.value.length);
    const canceledTasksCount = computed(() => canceledTasks.value.length);

    return {
      tasks,
      completedTasks,
      canceledTasks,
      personalNotes,
      error,
      taskName,
      noteName,
      noteMessage,
      errors,
      validateAndAddTask,
      cancelTask,
      updateTask,
      addNote,
      pendingTasks,
      completedTasksCount,
      canceledTasksCount
    };
  }
};
</script>

<style scoped>
.container {
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.alert {
  margin-bottom: 15px;
}

.section-title {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
  color: #343a40;
  text-transform: uppercase;
}

.table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: center;
}

.table th {
  background-color: #007bff;
  color: #fff;
}

.table .text-success {
  color: #28a745;
}

.table .text-danger {
  color: #dc3545;
}

.btn {
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 15px;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 10px;
  border-radius: 4px;
}

.alert-danger strong {
  font-weight: bold;
}

.text-muted {
  color: #6c757d;
  font-style: italic;
}

.text-center {
  text-align: center;
}

.text-uppercase {
  text-transform: uppercase;
}

.text-small {
  font-size: 14px;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>



