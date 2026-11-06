
const cases = [
  {
    id: 1,
    tag: "Honestidad",
    title: "El examen compartido",
    story: "Un compañero encuentra las respuestas de un examen antes de la evaluación y las envía al grupo. ¿Qué harías?",
    options: [
      "Avisar al docente",
      "No utilizarlas y hablar con el grupo",
      "Ignorar lo ocurrido"
    ]
  },
  {
    id: 2,
    tag: "Empatía",
    title: "El compañero nuevo",
    story: "Un estudiante nuevo se queda solo durante el recreo mientras tus amistades prefieren seguir jugando. ¿Qué decides?",
    options: [
      "Invitarlo a participar",
      "Acercarme después",
      "No intervenir"
    ]
  },
  {
    id: 3,
    tag: "Justicia",
    title: "El trabajo en equipo",
    story: "Una integrante del equipo faltó por un problema familiar y no pudo completar su parte. ¿Cómo debería evaluarse su participación?",
    options: [
      "Escuchar su situación y reorganizar",
      "Aplicar la misma regla sin excepción",
      "Pedir mediación al docente"
    ]
  },
  {
    id: 4,
    tag: "Responsabilidad",
    title: "El rumor viral",
    story: "Circula un mensaje sobre un estudiante sin pruebas. Varias personas te piden compartirlo. ¿Qué haces?",
    options: [
      "No compartir y pedir que se detenga",
      "Consultar una fuente confiable sin difundirlo",
      "Ignorar el mensaje"
    ]
  }
];

const $ = id => document.getElementById(id);

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let profile = load("moralab_profile", null);
let votes = load("moralab_votes", {});
let posts = load("moralab_posts", []);

function render() {
  $("accountBtn").textContent = profile
    ? "👤 " + profile.username
    : "Ingresar";

  $("caseList").replaceChildren();

  cases.forEach(c => {
    const card = document.createElement("article");
    card.className = "card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = c.tag;

    const title = document.createElement("h3");
    title.textContent = c.title;

    const description = document.createElement("p");
    description.textContent = c.story;

    const area = document.createElement("div");
    area.className = "choices";

    card.append(tag, title, description, area);

    if (votes[c.id] !== undefined) {
      const note = document.createElement("p");
      note.className = "hint";
      note.textContent =
        "Tu respuesta: " + c.options[votes[c.id]];

      area.append(note);

      // Solo representa el voto de este navegador.
      // No son estadísticas colectivas reales.
      const counts = c.options.map((_, i) =>
        i === votes[c.id] ? 1 : 0
      );

      counts.forEach((count, i) => {
        const percentage = count * 100;

        const result = document.createElement("div");
        result.className = "result";
        result.textContent =
          c.options[i] + " — " + percentage + "%";

        const bar = document.createElement("div");
        bar.className = "bar";

        const fill = document.createElement("i");
        fill.style.width = percentage + "%";

        bar.append(fill);
        result.append(bar);
        area.append(result);
      });
    } else {
      c.options.forEach((option, i) => {
        const button = document.createElement("button");
        button.className = "choice";
        button.textContent = option;

        button.onclick = () => {
          if (!profile) {
            $("authDialog").showModal();
            return;
          }

          votes[c.id] = i;
          save("moralab_votes", votes);
          render();
        };

        area.append(button);
      });
    }

    const hint = document.createElement("small");
    hint.className = "hint";
    hint.textContent =
      "Demostración: el voto se guarda en este navegador.";

    card.append(hint);
    $("caseList").append(card);
  });

  renderPosts();
}

function renderPosts() {
  const root = $("posts");
  root.replaceChildren();

  posts.slice().reverse().forEach(post => {
    const element = document.createElement("div");
    element.className = "post";

    const author = document.createElement("b");
    author.textContent = post.author + " · ";

    const date = document.createElement("small");
    date.textContent = post.date;

    const message = document.createElement("p");
    message.textContent = post.text;

    element.append(author, date, message);
    root.append(element);
  });
}

$("accountBtn").onclick = () => {
  $("username").value = profile?.username || "";
  $("email").value = profile?.email || "";
  $("authDialog").showModal();
};

$("closeDialog").onclick = () => {
  $("authDialog").close();
};

$("saveProfile").onclick = () => {
  const username = $("username").value.trim();
  const email = $("email").value.trim();

  if (
    !username ||
    !email ||
    !/^\S+@\S+\.\S+$/.test(email)
  ) {
    alert("Escribe un usuario y un correo válido.");
    return;
  }

  const file = $("avatar").files[0];

  if (
    file &&
    (
      file.size > 1000000 ||
      ![
        "image/png",
        "image/jpeg",
        "image/webp"
      ].includes(file.type)
    )
  ) {
    alert("Utiliza PNG, JPG o WebP de hasta 1 MB.");
    return;
  }

  function finish(avatar) {
    profile = { username, email, avatar };

    save("moralab_profile", profile);
    $("authDialog").close();
    render();
  }

  if (file) {
    const reader = new FileReader();

    reader.onload = () => finish(reader.result);
    reader.readAsDataURL(file);
  } else {
    finish(profile?.avatar || null);
  }
};

$("logout").onclick = () => {
  profile = null;
  localStorage.removeItem("moralab_profile");
  $("authDialog").close();
  render();
};

$("postBtn").onclick = () => {
  if (!profile) {
    $("authDialog").showModal();
    return;
  }

  const message = $("postText").value.trim();

  if (message.length < 5) {
    alert("Escribe una reflexión más completa.");
    return;
  }

  posts.push({
    author: profile.username,
    date: new Date().toLocaleDateString("es-PE"),
    text: message
  });

  save("moralab_posts", posts);

  $("postText").value = "";
  renderPosts();
};

render();
