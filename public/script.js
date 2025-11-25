const apiBase = "";

// Utils -------------------------------------------------------

function show(el) {
  if (!el) return;
  el.classList.remove("hidden");
}

function hide(el) {
  if (!el) return;
  el.classList.add("hidden");
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

// Fetch helper ------------------------------------------------

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

function mostrarCookieFlash() {
  const flash = document.getElementById("cookieFlash");
  if (!flash) return;

  flash.classList.remove("hidden");

  setTimeout(() => {
    flash.classList.add("show");

    const remover = () => {
      flash.classList.remove("show");
      setTimeout(() => flash.classList.add("hidden"), 300);
      document.removeEventListener("click", remover);
    };

    document.addEventListener("click", remover);
  }, 100);
}


document.addEventListener("DOMContentLoaded", () => {
  // VIEWS
  const viewAuth = document.getElementById("view-auth");
  const viewDashboard = document.getElementById("view-dashboard");
  const appHeader = document.getElementById("appHeader");

  // Auth forms
  const formLogin = document.getElementById("formLogin");
  const formRegister = document.getElementById("formRegister");
  const erroLogin = document.getElementById("erroLogin");
  const erroRegister = document.getElementById("erroRegister");

  // Perfil
  const formPerfil = document.getElementById("formPerfil");
  const msgPerfil = document.getElementById("msgPerfil");

  // Currículo (painel principal)
  const formCurriculo = document.getElementById("formCurriculo");
  const erroCurriculo = document.getElementById("erroCurriculo");
  const msgCurriculo = document.getElementById("msgCurriculo");
  const listaCurriculos = document.getElementById("listaCurriculos");
  const btnNovoCurriculo = document.getElementById("btnNovoCurriculo");
  const secCurriculo = document.getElementById("secCurriculo");

  // Header actions / user menu
  const btnHeaderLogout = document.getElementById("btnHeaderLogout");
  const btnHeaderPerfilScroll = document.getElementById("btnHeaderPerfil");
  const btnUserMenu = document.getElementById("btnUserMenu");
  const userMenuDropdown = document.getElementById("userMenuDropdown");
  const btnIrPerfil = document.getElementById("btnIrPerfil");

  // Cookie bar
  const cookieBar = document.getElementById("cookieBar");
  const btnCookieAceitar = document.getElementById("btnCookieAceitar");
  const btnCookieGerenciar = document.getElementById("btnCookieGerenciar");

  // ---------------- COOKIE BAR -----------------

  function verificarCookieConsent() {
    if (!cookieBar) return;
    const aceito = localStorage.getItem("rhconnectcv_cookies_aceitos");
    if (!aceito) {
      show(cookieBar);
    }
  }

  if (btnCookieAceitar && cookieBar) {
    btnCookieAceitar.addEventListener("click", () => {
      localStorage.setItem("rhconnectcv_cookies_aceitos", "true");
      hide(cookieBar);
    });
  }

  if (btnCookieGerenciar) {
    btnCookieGerenciar.addEventListener("click", () => {
      alert(
        "Em um sistema real, aqui o usuário poderia escolher quais tipos de cookies aceitar. Neste protótipo acadêmico, exibimos apenas a opção de aceitar todos."
      );
    });
  }

  // ---------------- USER MENU (ÍCONE PERFIL) -----------------

  if (btnUserMenu && userMenuDropdown) {
    btnUserMenu.addEventListener("click", (e) => {
      e.stopPropagation();

      const estavaFechado = userMenuDropdown.classList.contains("hidden");

      document.querySelectorAll(".user-menu-dropdown").forEach((menu) => {
        menu.classList.add("hidden");
        menu.classList.remove("open");
      });

      if (estavaFechado) {
        userMenuDropdown.classList.remove("hidden");
        userMenuDropdown.classList.add("open");
      }
    });

    userMenuDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      userMenuDropdown.classList.add("hidden");
      userMenuDropdown.classList.remove("open");
    });
  }

  if (btnIrPerfil) {
    btnIrPerfil.addEventListener("click", () => {
      window.location.href = "perfil.html";
    });
  }

  // ---------------- AUTENTICAÇÃO -----------------

  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (erroRegister) erroRegister.hidden = true;

      const nome = document.getElementById("regNome").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const telefone = document.getElementById("regTelefone").value.trim();
      const senha = document.getElementById("regSenha").value;
      const consentimento = document
        .getElementById("regConsentimento")
        .checked;

      if (!consentimento) {
        setText(
          erroRegister,
          "É obrigatório aceitar a Política de Privacidade para criar a conta."
        );
        if (erroRegister) erroRegister.hidden = false;
        return;
      }

      try {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ nome, email, telefone, senha, consentimento }),
        });

        await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, senha }),
        });

        if (viewDashboard) {
          await carregarPerfil();
          await carregarCurriculos();
          hide(viewAuth);
          show(viewDashboard);
          show(appHeader);
          verificarCookieConsent();
        } else {
          window.location.href = "index.html";
        }
      } catch (err) {
        setText(
          erroRegister,
          err.error || "Erro ao criar conta. Tente novamente."
        );
        if (erroRegister) erroRegister.hidden = false;
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (erroLogin) erroLogin.hidden = true;

      const email = document.getElementById("loginEmail").value.trim();
      const senha = document.getElementById("loginSenha").value;

      try {
        await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, senha }),
        });

        if (viewDashboard) {
          await carregarPerfil();
          await carregarCurriculos();
          hide(viewAuth);
          show(viewDashboard);
          show(appHeader);
          verificarCookieConsent();
        } else {
          window.location.href = "index.html";
        }
      } catch (err) {
        setText(erroLogin, err.error || "E-mail ou senha inválidos.");
        if (erroLogin) erroLogin.hidden = false;
      }
    });
  }

  // ---------------- PERFIL -----------------

  async function carregarPerfil() {
    if (!formPerfil) return;
    try {
      const data = await apiFetch("/api/auth/me");
      document.getElementById("perfilNome").value = data.nome || "";
      document.getElementById("perfilEmail").value = data.email || "";
      document.getElementById("perfilTelefone").value = data.telefone || "";
    } catch (err) {
      if (viewDashboard && viewAuth) {
        hide(viewDashboard);
        hide(appHeader);
        show(viewAuth);
      } else {
        window.location.href = "index.html";
      }
      throw err;
    }
  }

  if (formPerfil) {
    formPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msgPerfil) msgPerfil.hidden = true;

      const nome = document.getElementById("perfilNome").value.trim();
      const telefone = document
        .getElementById("perfilTelefone")
        .value.trim();

      try {
        await apiFetch("/api/usuarios/me", {
          method: "PUT",
          body: JSON.stringify({ nome, telefone }),
        });
        if (msgPerfil) msgPerfil.hidden = false;
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (btnHeaderPerfilScroll && document.getElementById("secPerfil")) {
    btnHeaderPerfilScroll.addEventListener("click", () => {
      document
        .getElementById("secPerfil")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ---------------- LOGOUT -----------------

  if (btnHeaderLogout) {
    btnHeaderLogout.addEventListener("click", async () => {
      try {
        await apiFetch("/api/auth/logout", { method: "POST" });
      } catch (err) {
        console.error(err);
      } finally {
        if (viewDashboard && viewAuth) {
          hide(viewDashboard);
          hide(appHeader);
          show(viewAuth);
        } else {
          window.location.href = "index.html";
        }
      }
    });
  }

  // ---------------- CURRÍCULOS (PAINEL) -----------------

  async function carregarCurriculos() {
    if (!listaCurriculos) return;

    listaCurriculos.innerHTML = "<p>Carregando currículos...</p>";
    try {
      const itens = await apiFetch("/api/curriculos");
      if (!itens.length) {
        listaCurriculos.innerHTML =
          '<p class="card-intro">Você ainda não cadastrou nenhum currículo.</p>';
        return;
      }

      listaCurriculos.innerHTML = "";
      itens.forEach((item) => {
        const div = document.createElement("div");
        div.className = "curriculo-item";

        const header = document.createElement("div");
        header.className = "curriculo-item-header";

        const vagaSpan = document.createElement("span");
        vagaSpan.className = "curriculo-vaga";
        vagaSpan.textContent = item.vaga || "Currículo cadastrado";

        const dataSpan = document.createElement("span");
        dataSpan.className = "curriculo-data";
        const data = item.data_consentimento || item.criado_em;
        dataSpan.textContent = data ? `Enviado em ${data}` : "";

        header.appendChild(vagaSpan);
        header.appendChild(dataSpan);

        const linkDiv = document.createElement("div");
        linkDiv.className = "curriculo-link";
        const a = document.createElement("a");
        a.href = item.curriculo_link || "#";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = item.curriculo_link || "Ver currículo";
        linkDiv.appendChild(a);

        div.appendChild(header);
        div.appendChild(linkDiv);
        listaCurriculos.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      listaCurriculos.innerHTML =
        "<p>Não foi possível carregar os currículos no momento.</p>";
    }
  }

  if (formCurriculo) {
    formCurriculo.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (erroCurriculo) erroCurriculo.hidden = true;
      if (msgCurriculo) msgCurriculo.hidden = true;

      const vaga = document.getElementById("curVaga").value.trim();
      const arquivoInput = document.getElementById("curArquivo");
      const consentimento = document
        .getElementById("curConsentimento")
        .checked;

      const arquivoNome =
        arquivoInput && arquivoInput.files && arquivoInput.files[0]
          ? arquivoInput.files[0].name
          : "";

      if (!vaga || !arquivoNome) {
        setText(
          erroCurriculo,
          "Vaga e arquivo do currículo são obrigatórios."
        );
        if (erroCurriculo) erroCurriculo.hidden = false;
        return;
      }

      if (!consentimento) {
        setText(
          erroCurriculo,
          "É obrigatório autorizar o uso dos dados deste currículo para fins de recrutamento."
        );
        if (erroCurriculo) erroCurriculo.hidden = false;
        return;
      }

      try {
        await apiFetch("/api/curriculos", {
          method: "POST",
          body: JSON.stringify({
            vaga,
            curriculoLink: arquivoNome,
            consentimento,
          }),
        });

        if (msgCurriculo) msgCurriculo.hidden = false;
        formCurriculo.reset();
        await carregarCurriculos();
      } catch (err) {
        setText(
          erroCurriculo,
          err.error || "Erro ao cadastrar currículo. Tente novamente."
        );
        if (erroCurriculo) erroCurriculo.hidden = false;
      }
    });
  }

  if (btnNovoCurriculo && secCurriculo) {
    btnNovoCurriculo.addEventListener("click", () => {
      secCurriculo.scrollIntoView({ behavior: "smooth", block: "start" });
      const vagaInput = document.getElementById("curVaga");
      if (vagaInput) vagaInput.focus();
    });
  }

  // ---------------- VAGAS (PÁGINA vagas.html) -----------------

  let curriculosCacheVagas = null;

  async function carregarCurriculosParaVagas() {
    if (curriculosCacheVagas !== null) return curriculosCacheVagas;
    try {
      const itens = await apiFetch("/api/curriculos");
      curriculosCacheVagas = itens || [];
    } catch (err) {
      if (err && err.error === "Não autenticado.") {
        window.location.href = "index.html";
        return [];
      }
      curriculosCacheVagas = [];
    }
    return curriculosCacheVagas;
  }

  const vagaDetalhes = document.getElementById("vagaDetalhes");
  const vagaCards = document.querySelectorAll(".vaga-card");

  const vagasConfig = {
    "dev-python-jr": {
      titulo: "Desenvolvedor(a) Python Jr",
      empresa: "TechFlow Analytics",
      local: "Joinville · SC",
      tipo: "Híbrido · CLT · Júnior",
      descricao:
        "Buscamos um(a) Dev Python Jr apaixonado(a) por automação para criar scripts e robôs que apoiem a emissão de relatórios e a análise de dados.",
      responsabilidades: [
        "Desenvolver scripts Python eficientes para automação de relatórios.",
        "Trabalhar em conjunto com equipes de backend e QA para garantir a qualidade das soluções.",
        "Seguir boas práticas de desenvolvimento, testes e documentação.",
      ],
      requisitos: [
        "Conhecimento sólido em Python.",
        "Noções de SQL e bancos relacionais.",
        "Familiaridade com Git e controle de versão.",
      ],
    },
    "analista-dados-pl": {
      titulo: "Analista de Dados Pleno",
      empresa: "InsightPlus BI",
      local: "São Paulo · SP",
      tipo: "Remoto · PJ · Pleno",
      descricao:
        "Profissional responsável por modelar dados, construir dashboards e apoiar decisões estratégicas da empresa.",
      responsabilidades: [
        "Construir pipelines de dados para atender demandas de negócio.",
        "Criar dashboards em ferramentas de BI e acompanhar indicadores.",
        "Realizar análises ad-hoc para times de produto e diretoria.",
      ],
      requisitos: [
        "Experiência com SQL e modelagem de dados.",
        "Vivência com ferramentas de BI (Power BI, Tableau ou Looker).",
        "Boa comunicação e visão de negócio.",
      ],
    },
  };

  async function abrirVaga(codigo) {
    if (!vagaDetalhes) return;

    vagaCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.vaga === codigo);
    });

    const vaga = vagasConfig[codigo];
    if (!vaga) return;

    const curriculos = await carregarCurriculosParaVagas();

    vagaDetalhes.innerHTML = `
      <h2 class="vaga-titulo">${vaga.titulo}</h2>
      <p class="vaga-empresa">${vaga.empresa}</p>
      <p class="vaga-local-tipo">${vaga.local} · ${vaga.tipo}</p>

      <h3 class="vaga-section-title">Sobre a vaga</h3>
      <p class="vaga-descricao">${vaga.descricao}</p>

      <h3 class="vaga-section-title">Responsabilidades</h3>
      <ul class="vaga-lista">
        ${vaga.responsabilidades.map((item) => `<li>${item}</li>`).join("")}
      </ul>

      <h3 class="vaga-section-title">Requisitos</h3>
      <ul class="vaga-lista">
        ${vaga.requisitos.map((item) => `<li>${item}</li>`).join("")}
      </ul>

      <div class="vaga-aplicar">
        <h3 class="vaga-section-title">Enviar currículo cadastrado</h3>
        ${
          !curriculos.length
            ? `<p class="card-intro">Você ainda não tem currículos cadastrados. Cadastre um no painel principal antes de se candidatar.</p>`
            : `
          <label for="selectCurriculoVaga" class="vaga-label">Selecione um currículo</label>
          <select id="selectCurriculoVaga" class="vaga-select">
            <option value="">Selecione um currículo</option>
            ${curriculos
              .map(
                (c) =>
                  `<option value="${c.id}">${c.vaga || "Currículo"} · ${
                    c.curriculo_link || "arquivo"
                  }</option>`
              )
              .join("")}
          </select>
          <button class="primary-btn vaga-btn-enviar" id="btnEnviarCandidatura">
            Enviar currículo para esta vaga
          </button>
          <p id="msgCandidatura" class="vaga-msg"></p>
          `
        }
      </div>
    `;

    if (!curriculos.length) return;

    const btnEnviar = document.getElementById("btnEnviarCandidatura");
    const selectCur = document.getElementById("selectCurriculoVaga");
    const msg = document.getElementById("msgCandidatura");

    if (btnEnviar && selectCur && msg) {
      btnEnviar.addEventListener("click", () => {
        msg.textContent = "";
        msg.className = "vaga-msg";

        const selecionado = selectCur.value;
        if (!selecionado) {
          msg.textContent = "Escolha um currículo para enviar.";
          msg.classList.add("error-message");
          return;
        }

        // Simulação de envio
        const key = "rhconnectcv_candidaturas";
        const existentes = JSON.parse(localStorage.getItem(key) || "[]");
        existentes.push({
          vaga: codigo,
          curriculoId: Number(selecionado),
          data: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(existentes));

        msg.textContent =
          "Currículo enviado para a vaga com sucesso. Boa sorte no processo! 🙂";
        msg.classList.add("success-message");
        btnEnviar.disabled = true;
        selectCur.disabled = true;
      });
    }
  }

  if (vagaCards && vagaCards.length && vagaDetalhes) {
    vagaCards.forEach((card) => {
      card.addEventListener("click", () => abrirVaga(card.dataset.vaga));
    });

    abrirVaga(vagaCards[0].dataset.vaga);
  }

  // ---------------- ESTADO INICIAL -----------------
  // Aqui está a mudança importante: decidir se mostra login ou painel
  async function inicializarIndex() {
    if (!(viewAuth && viewDashboard)) return;

    try {
      // se conseguir pegar /me, está logado
      await apiFetch("/api/auth/me");
      hide(viewAuth);
      show(viewDashboard);
      show(appHeader);
      await carregarCurriculos();
      verificarCookieConsent();
    } catch (err) {
      // não autenticado → mostra login
      hide(viewDashboard);
      hide(appHeader);
      show(viewAuth);
    }
  }

  if (viewAuth && viewDashboard) {
    // index.html (login + painel)
    inicializarIndex().catch((e) => console.error(e));
  } else if (formPerfil && !viewDashboard && !viewAuth) {
    // página de perfil isolada
    carregarPerfil().catch((err) => console.error(err));
  }
});
