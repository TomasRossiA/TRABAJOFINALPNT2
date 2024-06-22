<template>
  <div class="container mt-5">
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <task-form @add-task="addTask"></task-form>
    <task-list :tasks="tasks" @delete-task="deleteTask" @update-task="updateTask"></task-list>
    <p v-if="tasks.length === 0">No hay tareas agregadas.</p>
    <p>Tareas completadas: {{ completedTasksCount }}</p>
  </div>
</template>

<script>
import { computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';

import TaskForm from '@/components/TaskManager.vue';
import TaskList from '@/components/TaskList.vue';

export default {
  components: {
    TaskForm,
    TaskList
  },
  setup() {
    const store = useStore();
    const state = reactive({
      tasks: [],
      error: null
    });

    const fetchTasks = async () => {
      try {
        await store.dispatch('fetchTasks');
        state.tasks = store.state.tasks;
        state.error = store.state.error;
      } catch (error) {
        state.error = error.message;
      }
    };

    const addTask = async (taskData) => {
      try {
        await store.dispatch('addTask', taskData);
        await fetchTasks();
      } catch (error) {
        state.error = error.message;
      }
    };

    const deleteTask = async (taskId) => {
      try {
        await store.dispatch('deleteTask', taskId);
        await fetchTasks();
      } catch (error) {
        state.error = error.message;
      }
    };

    const updateTask = async (taskData) => {
      try {
        await store.dispatch('updateTask', taskData);
        await fetchTasks();
      } catch (error) {
        state.error = error.message;
      }
    };

    onMounted(fetchTasks);

    const completedTasksCount = computed(() => state.tasks.filter(task => task.completed).length);

    return {
      ...state,
      addTask,
      deleteTask,
      updateTask,
      completedTasksCount
    };
  }
};
</script>

<style scoped>
</style>
