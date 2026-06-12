// Read the centralized API URL directly from your api.js file
const API_BASE = API_BASE_URL;

const app = Vue.createApp({
  data() {
    return {
      token: localStorage.getItem("mcafe_token") || "",
      loginForm: { username: "", password: "" },
      activeView: "menu",
      menuItems: [],
      editingMenuId: null,
      newMenu: {
        menu_name: "",
        category: "",
        price: "",
        availability: "Available",
      },
    };
  },
  mounted() {
    this.fetchMenu();
  },
  computed: {
    isAuthenticated() {
      return Boolean(this.token);
    },
  },
  methods: {
    fetchMenu() {
      fetch(`${API_BASE}/menu`)
        .then((response) => response.json())
        .then((data) => {
          this.menuItems = Array.isArray(data) ? data : [];
        })
        .catch((error) => console.error("Fetch menu error:", error));
    },
    loginStaff() {
      // Use the uniform API_BASE constant consistently
      fetch(API_BASE + "/login", {
        method: "POST",
        headers: publicHeaders(), // References publicHeaders() utility from api.js
        body: JSON.stringify({
          // Map to your nested loginForm data properties correctly
          username: this.loginForm.username,
          password: this.loginForm.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            this.token = data.token; // Dynamically track state inside application variables
            localStorage.setItem("mcafe_token", data.token); // Store token on client side[cite: 1]
            this.activeView = "menu"; // Automatically redirect back to menu view[cite: 1]
            alert("Login successful"); // Prompt login notification[cite: 1]
            this.fetchMenu(); // Reload the data
          } else {
            alert("Login failed"); // Prompt login alternative notification[cite: 1]
          }
        })
        .catch((error) => console.error("Login error:", error));
    },
    authHeaders() {
      // Explicit blank space spacing fixes JWT parsing middleware rejections[cite: 1]
      return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      };
    },
    logout() {
      this.token = "";
      localStorage.removeItem("mcafe_token"); // Evict tokens on client logout request[cite: 1]
      this.loginForm = { username: "", password: "" };
      this.activeView = "menu";
      this.resetForm();
      this.menuItems = [];
      this.fetchMenu();
    },
    goToLogin() {
      this.activeView = "login";
    },
    goToMenu() {
      this.activeView = "menu";
    },
    resetForm() {
      this.editingMenuId = null;
      this.newMenu = {
        menu_name: "",
        category: "",
        price: "",
        availability: "Available",
      };
    },
    editMenu(item) {
      this.editingMenuId = item.menu_id;
      this.newMenu = {
        menu_name: item.menu_name || "",
        category: item.category || "",
        price: item.price || "",
        availability: item.availability || "Available",
      };
    },
    saveMenu() {
      if (!this.isAuthenticated) {
        alert("Please log in first.");
        return;
      }

      const method = this.editingMenuId ? "PUT" : "POST"; // Match required action pattern[cite: 1]
      const url = this.editingMenuId
        ? `${API_BASE}/menu/${this.editingMenuId}`
        : `${API_BASE}/menu`;

      fetch(url, {
        method,
        headers: this.authHeaders(), // Include valid authorization credentials header block[cite: 1]
        body: JSON.stringify(this.newMenu),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            this.fetchMenu(); // Refresh content tables[cite: 1]
            this.resetForm();
            alert("Menu item saved successfully");
            return;
          }
          alert(data.message || "Unable to save menu item");
        })
        .catch((error) => console.error("Save menu error:", error));
    },
    deleteMenu(id) {
      if (!this.isAuthenticated) {
        alert("Please log in first.");
        return;
      }

      fetch(`${API_BASE}/menu/${id}`, {
        method: "DELETE", // Formulates target standard delete structure[cite: 1]
        headers: this.authHeaders(), // Employs structural authentication verification payload[cite: 1]
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchMenu(); // Refresh content tables[cite: 1]
          alert("Menu item deleted"); // Confirm update validation[cite: 1]
        })
        .catch((error) => console.error("Delete menu error:", error));
    },
  },
});

app.mount("#app");
