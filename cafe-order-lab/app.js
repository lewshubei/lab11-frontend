const API_URL =
  "http://localhost/lab-activity-10-lewshubei/mycampus-cafe-slim-api/public/api";
const API_BASE = API_URL;
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
        });
    },
    loginStaff() {
      fetch(API_BASE_URL + "/login", {
        method: "POST",
        headers: publicHeaders(),
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("mcafe_token", data.token);
            this.isLoggedIn = true;
            alert("Login successful");
          } else {
            alert("Login failed");
          }
        })
        .catch((error) => console.error("Login error:", error));
    },
    authHeaders() {
      return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      };
    },
    logout() {
      this.token = "";
      localStorage.removeItem("mcafe_token");
      this.isLoggedIn = false;
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
            return;
          }
          alert(data.message || "Unable to save menu item");
        });
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
        .then(() => this.fetchMenu());
    },
  },
});

app.mount("#app");
