// --------------- importações do firebase ---------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, getDocs, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB9GSbE_NTbPLQtJOBNXjVpMW1AbeSh3JE",
  authDomain: "agendamento-cbce6.firebaseapp.com",
  projectId: "agendamento-cbce6",
  storageBucket: "agendamento-cbce6.firebasestorage.app",
  messagingSenderId: "981247731351",
  appId: "1:981247731351:web:b6e92a11119515157bebd2",
  measurementId: "G-G6VXKP2V88"
};

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --------------- adicionar agendamento no firestore ---------------
window.agendar = async function () {
  const data = document.getElementById("data").value;
  const horario = document.getElementById("horario").value;
  const matricula = document.getElementById("matricula").value;
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const tema = document.getElementById("tema").value;
  const assunto = document.getElementById("assunto").value;

  await addDoc(collection(db, "agendamentos"), {
    data: data,
    horario: horario,
    matricula: matricula,
    nome: nome,
    email: email,
    tema: tema,
    assunto: assunto
  });

  alert("Agendamento realizado!");
  if (typeof carregarHorarios === "function") {
    carregarHorarios();
  }
};





// --------------- adicionar horario de preferencia ---------------
window.salvarHorarios = async function () {
  const horarioInicio = document.getElementById("horarioInicio").value;
  const [horaInicio, minutoInicio] = horarioInicio.split(":");
  const minutosTotais_Inicio = parseInt(horaInicio) * 60 + parseInt(minutoInicio);

  const horarioFim = document.getElementById("horarioFim").value;   
  const [horaFim, minutoFim] = horarioFim.split(":");
  const minutosTotais_Fim = parseInt(horaFim) * 60 + parseInt(minutoFim);

  const intervalo = 30; 
  const horas = [];

  for (let m = minutosTotais_Inicio; m <= minutosTotais_Fim; m += intervalo) {
    // m começa em 570, depois 600, depois 630, ...
    horas.push(m);
}

  const horariosFormatados = horas.map(minutosInicio => {
    const h = Math.floor(minutosInicio / 60);
    const m = minutosInicio % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  });

  
  await setDoc(doc(db, "horarios", "horarioFixo"), {
    inicio: horarioInicio,
    fim: horarioFim,
    intervalo,
    horariosFormatados
  });

  alert("Horários salvos!");
};



// --------------- buscar horarios de preferencia ---------------
window.carregarHorarios = async function () {
  const selectHorario = document.getElementById("horario");
  if (!selectHorario) return;

  const horariosRef = doc(db, "horarios", "horarioFixo");
  const snapshot = await getDoc(horariosRef);

  if (!snapshot.exists()) {
    console.log("Documento não encontrado");
    return;
  }

  const ocupados = await verHorariosOcupados();

  const dados = snapshot.data();
  const lista = dados.horariosFormatados || [];

  selectHorario.innerHTML = "";

  lista.forEach(horario => {
    const option = document.createElement("option");
    option.value = horario;
    option.textContent = horario;

    if (ocupados.includes(horario)) {
      option.disabled = true;
    }

    selectHorario.appendChild(option);
  });
};


if (document.getElementById("horario")) {
  carregarHorarios();
}






window.logar = async function (){

  var login = document.getElementById("login").value;
  var senha = document.getElementById("senha").value;
  if(login == "pati" && senha == "123"){
    location.href = "admin.html";
  }else{
    alert("Login ou senha incorretos!");
  }

}



// --------------- buscar horarios de preferencia ---------------
window.mostrarAgendamentos = async function () {
  const divAgendamentos = document.getElementById("agendamentos-div");
  if (!divAgendamentos) return;

  const agendamentosRef = collection(db, "agendamentos");
  const snapshot = await getDocs(agendamentosRef);

  if (snapshot.empty) {
    console.log("Documento não encontrado");
    return;
  }

  const lista = [];
  snapshot.forEach(doc => {
    lista.push({
      id: doc.id,
      ...doc.data()
    });
  });

  divAgendamentos.innerHTML = ""; 

  lista.forEach(agendamento => {
    const div = document.createElement("div");
    div.value = agendamento;
    let html = agendamento.data + " - " + agendamento.horario + " - " + agendamento.matricula +" - " + agendamento.nome + " - " + agendamento.email + " - " + agendamento.tema + " - " + agendamento.assunto + " - " + "<button onclick='deletarAgendamento(\"" + agendamento.id + "\")'>Deletar</button>";
    div.innerHTML = html;
    divAgendamentos.appendChild(div);
  });
};


if (document.getElementById("agendamentos-div")) {
  mostrarAgendamentos();
}




window.deletarAgendamento = async function (id) {
  await deleteDoc(doc(db, "agendamentos", id));
  alert("Agendamento deletado!");
  mostrarAgendamentos();

}





// ---------------  data ---------------
window.ajustarDatas = async function () {
  const checkDia = document.querySelectorAll(".dia");

  for (const cb of checkDia) {
    const dia = cb.dataset.dia; // "0" a "6"
    const status = cb.checked ? "ativo" : "inativo";

    await setDoc(doc(db, "dia-semana", dia), {
      status: status
    });
  }

  alert("Dias atualizados no banco!");
};



async function buscarDias() {
  const ref = collection(db, "dia-semana");
  const snapshot = await getDocs(ref);

  const dias = {};

  snapshot.forEach(doc => {
    const id = doc.id; // "0", "1", ...
    const dados = doc.data();

    dias[id] = dados.status === "ativo";
  });

  return dias;
}


window.bloquearData = async function () {
  const data = document.getElementById("dataBloqueio").value;

  await addDoc(collection(db, "datas-bloqueadas"), {
    data: data,
  });

  alert("Data bloqueada!");
};

async function buscarDatasBloqueadas() {
  const ref = collection(db, "datas-bloqueadas");
  const snapshot = await getDocs(ref);

  const datas = [];

  snapshot.forEach(doc => {
    const dados = doc.data();

    datas.push(dados.data); 
  });

  return datas;
}


async function iniciarCalendario() {
  const diasPermitidos = await buscarDias();
  const datasBloqueadas = await buscarDatasBloqueadas();

  // 
  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const mesAtual = hoje.getMonth();

  let mesesPermitidos = [mesAtual];

  if (diaHoje >= 15) {
    mesesPermitidos.push(mesAtual + 1);
  }

  flatpickr("#data", {
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: [
      function(data) {
        const dia = data.getDay();
        const mes = data.getMonth();
        const dataFormatada = data.toISOString().split("T")[0];

        // mês não permitido
        if (!mesesPermitidos.includes(mes)) return true;

        // dia da semana não permitido
        if (!diasPermitidos[dia]) return true;

        // data específica bloqueada
        if (datasBloqueadas.includes(dataFormatada)) return true;

        return false;
      }
    ]
  });
}
iniciarCalendario();











// --------------- buscar horarios de preferencia ---------------
window.mostrarData = async function () {
  const divDatasBloqueadas = document.getElementById("datas-bloqueadas-div");
  if (!divDatasBloqueadas) return;

  const datasBloqueadasRef = collection(db, "datas-bloqueadas");
  const snapshot = await getDocs(datasBloqueadasRef);

  if (snapshot.empty) {
    console.log("Documento não encontrado");
    return;
  }

  const lista = [];
  snapshot.forEach(doc => {
    lista.push({
      id: doc.id,
      ...doc.data()
    });
  });

  divDatasBloqueadas.innerHTML = ""; 

  lista.forEach(datasBloqueadas => {
    const div = document.createElement("div");
    div.value = datasBloqueadas;
    let html = datasBloqueadas.data + " - " + "<button onclick='deletarDataBloqueada(\"" + datasBloqueadas.id + "\")'>Deletar</button>";
    div.innerHTML = html;
    divDatasBloqueadas.appendChild(div);
  });
};


if (document.getElementById("datas-bloqueadas-div")) {
  mostrarData();
}




window.deletarDataBloqueada = async function (id) {
  await deleteDoc(doc(db, "datas-bloqueadas", id));
  alert("Data bloqueada deletada!");
  mostrarData();
}



async function verHorariosOcupados() {
  const data = document.getElementById("data").value;

  const q = query(
    collection(db, "agendamentos"),
    where("data", "==", data)
  );

  const snapshot = await getDocs(q);

  const horariosOcupados = [];

  snapshot.forEach(doc => {
    const dados = doc.data();
    horariosOcupados.push(dados.horario);
  });

  return horariosOcupados;
}



// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyB9GSbE_NTbPLQtJOBNXjVpMW1AbeSh3JE",
//   authDomain: "agendamento-cbce6.firebaseapp.com",
//   projectId: "agendamento-cbce6",
//   storageBucket: "agendamento-cbce6.firebasestorage.app",
//   messagingSenderId: "981247731351",
//   appId: "1:981247731351:web:b6e92a11119515157bebd2",
//   measurementId: "G-G6VXKP2V88"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
