// Read the centralized API URL directly from your api.js file
const API_BASE = API_BASE_URL;

const app = Vue.createApp({
  data() {
    return {
      token: localStorage.getItem("mcafe_token") || "", // Tracks token initialization state
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
      fetch(API_BASE + "/login", {
        method: "POST",
        headers: publicHeaders(),
        body: JSON.stringify({
          username: this.loginForm.username,
          password: this.loginForm.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            // FIX 1: Update the correct reactive variable in Vue's state engine!
            this.token = data.token;
            localStorage.setItem("mcafe_token", data.token);

            this.activeView = "menu";
            alert("Login successful");
            this.fetchMenu();
          } else {
            alert("Login failed");
          }
        })
        .catch((error) => console.error("Login error:", error));
    },
    authHeaders() {
      // FIX 2: Fallback securely directly to persistent local storage memory parameters
      const currentToken =
        this.token || localStorage.getItem("mcafe_token") || "";
      return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + currentToken,
      };
    },
    logout() {
      // FIX 3: Fully clean up local data variables
      this.token = "";
      localStorage.removeItem("mcafe_token");
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

      const method = this.editingMenuId ? "PUT" : "POST";
      const url = this.editingMenuId
        ? `${API_BASE}/menu/${this.editingMenuId}`
        : `${API_BASE}/menu`;

      fetch(url, {
        method,
        headers: this.authHeaders(),
        body: JSON.stringify(this.newMenu),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            this.fetchMenu();
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
        method: "DELETE",
        headers: this.authHeaders(),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            this.fetchMenu();
            alert("Menu item deleted");
          } else {
            alert(data.message || "Delete failed");
          }
        })
        .catch((error) => console.error("Delete menu error:", error));
    },
  },
});

app.mount("#app");
