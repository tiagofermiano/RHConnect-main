const apiBase = "";

function setText(el, text) {
  el.textContent = text;
}

async function apiFetch(path, options = {}) {
  const resp = await fetch(apiBase + path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await resp.json();
  } catch (e) {
    data = {};
  }

  if (!resp.ok) {
    throw data;
  }
  return data;
}

document.addEventListener("DOMContentLoaded", () => {
  const formRegister = document.getElementById("formRegister");
  const erroRegister = document.getElementById("erroRegister");

  if (!formRegister) return;

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    erroRegister.hidden = true;

    const nome = document.getElementById("regNome").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const telefone = document.getElementById("regTelefone").value.trim();
    const senha = document.getElementById("regSenha").value;
    const consentimento = document.getElementById("regConsentimento").checked;

    if (!consentimento) {
      setText(
        erroRegister,
        "É obrigatório aceitar a Política de Privacidade para criar a conta."
      );
      erroRegister.hidden = false;
      return;
    }

    try {
      // 1) cria o usuário
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ nome, email, telefone, senha, consentimento }),
      });

      // 2) login automático
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      // 3) redireciona para a página inicial (index),
      // onde o script principal vai carregar o dashboard
      window.location.href = "index.html";
    } catch (err) {
      setText(
        erroRegister,
        err.error || "Erro ao criar conta. Tente novamente."
      );
      erroRegister.hidden = false;
    }
  });
});
