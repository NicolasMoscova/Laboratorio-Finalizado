(function(){
  function parseTime(hm) {
    var parts = hm.split(":");
    return new Date(0,0,0, parseInt(parts[0],10), parseInt(parts[1],10), 0,0);
  }
  function minutesBetween(a,b){
    return Math.abs((a-b)/60000);
  }

  var KEY = "peluqueria_reservas_v1";
  function loadReservas(){ try{ return JSON.parse(localStorage.getItem(KEY)||"[]"); }catch(e){ return []; } }
  function saveReservas(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

  window.createReserva = function(reserva){
    // reserva: Usuario, fecha, etc
    var date = new Date(reserva.date+"T00:00:00");
    var day = date.getUTCDay(); // 0 Sun,1 Mon,2 Tue...6 Sat
    if(day===0 || day===1){
      alert("Solo se pueden sacar turnos de martes a sabado (no domingo ni lunes).");
      return false;
    }
    // Chequeo de tiempo entre las 8 y las 19hs
    var t = parseTime(reserva.time);
    var startHour = t.getHours();
    var startMinute = t.getMinutes();
    if(startHour<8 || startHour>19 || (startHour===19 && startMinute>0)){
      alert("Solo se puede reservar entre las 08:00 y las 19:00.");
      return false;
    }
    var duration = reserva.durationMin || 30;
    var end = new Date(t.getTime() + duration*60000);
    if(end.getHours()>19 || (end.getHours()===19 && end.getMinutes()>0)){
      alert("El turno se extiende fuera del horario permitido (hasta 19:00).");
      return false;
    }
    // No menos de 30 minutos de diferencia entre turnos
    var list = loadReservas().filter(r=>r.date===reserva.date);
    for(var i=0;i<list.length;i++){
      var other = list[i];
      var ot = parseTime(other.time);
      var oend = new Date(ot.getTime() + (other.durationMin||30)*60000);
      var start = t;
      var endt = end;
  
      if(!(endt<=ot || start>=oend)){
        alert("Ese horario ya está reservado (se sobrepone). Elige otro horario.");
        return false;
      }
      // Chequeo de 30 minutos
      if(minutesBetween(start, oend) < 30 || minutesBetween(endt, ot) < 30){
        alert("Debe quedar al menos 30 minutos de diferencia entre turnos.");
        return false;
      }
    }
    // Guardados
    list = loadReservas();
    list.push(reserva);
    saveReservas(list);
    alert("Turno reservado correctamente.");
    return true;
  };

  // Ver reservas
  window.getVisibleReservas = function(username, role){
    var all = loadReservas();
    if(role && role.toLowerCase()==="admin") return all;
    // Ver reservas (no admin)
    return all.filter(r=>r.username===username);
  };

  // Texto en pantalla depende de quien se loguea
  function applyTitles(){
    var user = JSON.parse(localStorage.getItem("peluqueria_user")||"null");
    var titleEls = document.querySelectorAll(".main-title, #main-title, .titulo, h1.site-title");
    var subtitleEls = document.querySelectorAll(".main-subtitle, #main-subtitle, .subtitulo, p.site-subtitle");
    var isAdmin = user && user.username==="Sergio";
    titleEls.forEach(e=>{ if(isAdmin) e.textContent = "Agenda Virtual"; else e.textContent = "Peluqueria Masculina"; });
    subtitleEls.forEach(e=>{ if(isAdmin) e.textContent = "reserva tu turno de forma mas simple"; else e.textContent = "Ahora tenes la peluqueria al alcance de tu mano"; });
  }
  window.applyPeluqueriaTitles = applyTitles;
  document.addEventListener("DOMContentLoaded", applyTitles);
})();
