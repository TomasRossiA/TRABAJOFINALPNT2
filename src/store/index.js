import { createStore } from 'vuex';
import axios from 'axios';

const apiBaseUrl = 'https://jsonplaceholder.typicode.com/todos';

export default createStore({
  state: {
    tasks: [],
    completedTasks: [],
    canceledTasks: [],
    error: null
  },
  mutations: {
    setTasks(state, tasks) {
      state.tasks = tasks;
    },
    setError(state, error) {
      state.error = error;
    },
    addToCompletedTasks(state, task) {
      state.completedTasks.push(task);
    },
    addToCanceledTasks(state, task) {
      state.canceledTasks.push(task);
    },
    removeFromTasks(state, taskId) {
      state.tasks = state.tasks.filter(task => task.id !== taskId);
    },
    removeFromCompletedTasks(state, taskId) {
      state.completedTasks = state.completedTasks.filter(task => task.id !== taskId);
    }
  },
  actions: {
    async fetchTasks({ commit }) {
      try {
        const response = await axios.get(apiBaseUrl);
        commit('setTasks', response.data);
      } catch (error) {
        commit('setError', error.message);
      }
    },
    async addTask({ commit }, taskData) {
      try {
        const response = await axios.post(apiBaseUrl, {
          title: taskData.title,
          completed: false
        });
        commit('addToTasks', response.data);
        return response.data;
      } catch (error) {
        commit('setError', error.message);
        throw error;
      }
    },
    async deleteTask({ commit }, taskId) {
      try {
        await axios.delete(`${apiBaseUrl}/${taskId}`);
        commit('removeFromTasks', taskId);
        commit('removeFromCompletedTasks', taskId);
      } catch (error) {
        commit('setError', error.message);
        throw error;
      }
    },
    async updateTask({ commit, state }, taskData) {
      try {
        const response = await axios.put(`${apiBaseUrl}/${taskData.id}`, {
          title: taskData.title,
          completed: taskData.completed
        });
        if (response.data.completed) {
          commit('addToCompletedTasks', response.data);
        } else {
          commit('removeFromCompletedTasks', response.data.id);
        }
        commit('setTasks', [...state.tasks]);
      } catch (error) {
        console.error('Error al actualizar tarea:', error);
        commit('setError', error.message);
        throw error;
      }
    }
  },
  getters: {
    completedTasks(state) {
      return state.tasks.filter(task => task.completed);
    }
  }
});
