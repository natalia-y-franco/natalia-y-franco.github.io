/**
 * Google Apps Script — Backend para invitaciones de matrimonio
 * Natalia & Franco
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra el contenido de Code.gs y pega este código
 * 4. Guarda (Ctrl+S)
 * 5. Ejecuta generarTokens() (menú Ejecutar > generarTokens)
 *    - La primera vez pedirá permisos, acéptalos
 * 6. Despliega como app web:
 *    - Implementar > Nueva implementación
 *    - Tipo: App web
 *    - Ejecutar como: Yo
 *    - Acceso: Cualquier persona
 * 7. Copia la URL del despliegue y pégala en script.js (variable APPS_SCRIPT_URL)
 * 8. Cambia BASE_URL en generarLinksWhatsApp() por tu URL de GitHub Pages
 * 9. Ejecuta generarLinksWhatsApp() para generar los links de envío
 */

var HOJA = 'BB.DD';
var ADMIN_PASSWORD = 'NataliaFranco2026';

// ========================================
// WEB APP — Maneja peticiones GET
// ========================================
function doGet(e) {
  var params = e.parameter;
  var action = params.action;
  var token = params.token;

  // --- Acción: panel admin ---
  if (action === 'admin') {
    return handleAdmin(params);
  }

  if (!token) return respond({ error: 'Token requerido' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  // Buscar columna Token
  var tokenCol = -1;
  for (var c = 0; c < headers.length; c++) {
    if (headers[c] === 'Token') { tokenCol = c; break; }
  }
  if (tokenCol === -1) return respond({ error: 'Columna Token no encontrada. Ejecuta generarTokens() primero.' });

  // Buscar fila del invitado
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(token)) {
      targetRow = i;
      break;
    }
  }
  if (targetRow === -1) return respond({ error: 'Invitación no encontrada' });

  // --- Acción: obtener info del invitado ---
  if (action === 'info') {
    var confirmCol = indexOf(headers, 'Confirmación');
    var alergiaCol = indexOf(headers, 'Alergias');
    var detalleCol = indexOf(headers, 'Detalle alergias');
    return respond({
      ok: true,
      invitado: data[targetRow][2],
      acompanante: data[targetRow][3] || '',
      confirmacion: confirmCol >= 0 ? cellToStr(data[targetRow][confirmCol]).toUpperCase() : '',
      alergias: alergiaCol >= 0 ? cellToStr(data[targetRow][alergiaCol]).toUpperCase() : '',
      detalleAlergias: detalleCol >= 0 ? (data[targetRow][detalleCol] || '') : ''
    });
  }

  // --- Acción: guardar confirmación ---
  if (action === 'confirmar') {
    var row = targetRow + 1; // getRange es 1-indexed

    var confirmCol = indexOf(headers, 'Confirmación') + 1;
    var alergiaCol = indexOf(headers, 'Alergias') + 1;
    var detalleCol = indexOf(headers, 'Detalle alergias') + 1;

    if (confirmCol > 0) sheet.getRange(row, confirmCol).setValue(params.asistencia || '');
    if (alergiaCol > 0) sheet.getRange(row, alergiaCol).setValue(params.alergia || '');
    if (detalleCol > 0) sheet.getRange(row, detalleCol).setValue(params.detalle || '');

    return respond({ ok: true, mensaje: 'Confirmación guardada' });
  }

  return respond({ error: 'Acción no válida' });
}

// ========================================
// ADMIN — Devuelve todos los datos
// ========================================
function handleAdmin(params) {
  if (params.password !== ADMIN_PASSWORD) {
    return respond({ error: 'Contraseña incorrecta' });
  }

  var sub = params.sub || 'list';

  if (sub === 'addGuest') return adminAddGuest(params);
  if (sub === 'editGuest') return adminEditGuest(params);
  if (sub === 'deleteGuest') return adminDeleteGuest(params);
  if (sub === 'resetConfirm') return adminResetConfirm(params);
  if (sub === 'markSent') return adminMarkSent(params);
  if (sub === 'getMsgTemplate') return adminGetMsgTemplate();
  if (sub === 'saveMsgTemplate') return adminSaveMsgTemplate(params);
  if (sub === 'syncTokens') {
    var count = autoSync();
    return respond({ ok: true, synced: count, mensaje: count > 0 ? 'Se sincronizaron ' + count + ' invitados.' : 'Todo sincronizado, no hay tokens faltantes.' });
  }

  // Auto-sync: genera tokens/IDs faltantes antes de listar
  autoSync();

  // Default: list all guests
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  var invitados = [];
  var totalPersonas = 0;
  var confirmados = 0;
  var personasConfirmadas = 0;
  var declinados = 0;
  var personasDeclinadas = 0;
  var pendientes = 0;
  var conAlergias = 0;
  var enviadas = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var nombre = row[colMap['Invitado']] || '';
    var acompanante = String(row[colMap['Acompañante']] || '');
    var confirmacion = cellToStr(row[colMap['Confirmación']]).toUpperCase();
    var alergias = cellToStr(row[colMap['Alergias']]).toUpperCase();
    var enviadaVal = colMap['Enviada'] !== undefined ? cellToStr(row[colMap['Enviada']]).toUpperCase() : '';

    if (!nombre) continue;

    // Contar personas (invitado + acompañante si tiene)
    totalPersonas++;
    if (acompanante && acompanante.trim() !== '') totalPersonas++;

    // Stats
    if (confirmacion === 'TRUE') {
      confirmados++;
      personasConfirmadas++;
      if (acompanante && acompanante.trim() !== '') personasConfirmadas++;
    }
    else if (confirmacion === 'FALSE') {
      declinados++;
      personasDeclinadas++;
      if (acompanante && acompanante.trim() !== '') personasDeclinadas++;
    }
    else pendientes++;

    if (alergias === 'TRUE') conAlergias++;
    if (enviadaVal === 'TRUE') enviadas++;

    invitados.push({
      id: row[colMap['ID']] || i,
      grupo: row[colMap['Grupo Asociado']] || '',
      nombre: nombre,
      acompanante: acompanante,
      telefono: String(row[colMap['Teléfono']] || '').replace(/[^0-9]/g, ''),
      confirmacion: confirmacion,
      alergias: alergias,
      enviada: enviadaVal,
      personas: 1 + (acompanante && acompanante.trim() !== '' ? 1 : 0),
      detalleAlergias: row[colMap['Detalle alergias']] || '',
      token: row[colMap['Token']] || ''
    });
  }

  return respond({
    ok: true,
    stats: {
      totalInvitados: invitados.length,
      totalPersonas: totalPersonas,
      personasConfirmadas: personasConfirmadas,
      confirmados: confirmados,
      pendientes: pendientes,
      declinados: declinados,
      personasDeclinadas: personasDeclinadas,
      conAlergias: conAlergias,
      enviadas: enviadas
    },
    invitados: invitados
  });
}

// ========================================
// ADMIN — Agregar invitado
// ========================================
function adminAddGuest(params) {
  if (!params.nombre || !params.nombre.trim()) {
    return respond({ error: 'El nombre es obligatorio' });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  // Generar siguiente ID
  var maxId = 0;
  for (var i = 1; i < data.length; i++) {
    var id = parseInt(data[i][colMap['ID']]) || 0;
    if (id > maxId) maxId = id;
  }
  var newId = maxId + 1;

  // Generar token único
  var token = crearToken();

  // Construir nueva fila
  var newRow = [];
  for (var c = 0; c < headers.length; c++) {
    newRow.push('');
  }

  newRow[colMap['ID']] = newId;
  newRow[colMap['Grupo Asociado']] = params.grupo || '';
  newRow[colMap['Invitado']] = params.nombre.trim();
  newRow[colMap['Acompañante']] = params.acompanante || '';
  newRow[colMap['Teléfono']] = params.telefono || '';
  newRow[colMap['Token']] = token;

  sheet.appendRow(newRow);

  return respond({ ok: true, mensaje: 'Invitado agregado correctamente', token: token, id: newId });
}

// ========================================
// ADMIN — Editar invitado
// ========================================
function adminEditGuest(params) {
  if (!params.token) return respond({ error: 'Token requerido' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  var tokenCol = colMap['Token'];
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(params.token)) {
      targetRow = i + 1; // 1-indexed para getRange
      break;
    }
  }

  if (targetRow === -1) return respond({ error: 'Invitado no encontrado' });

  sheet.getRange(targetRow, colMap['Invitado'] + 1).setValue(params.nombre || '');
  sheet.getRange(targetRow, colMap['Acompañante'] + 1).setValue(params.acompanante || '');
  sheet.getRange(targetRow, colMap['Grupo Asociado'] + 1).setValue(params.grupo || '');
  sheet.getRange(targetRow, colMap['Teléfono'] + 1).setValue(params.telefono || '');

  return respond({ ok: true, mensaje: 'Invitado actualizado correctamente' });
}

// ========================================
// ADMIN — Eliminar invitado
// ========================================
function adminDeleteGuest(params) {
  if (!params.token) return respond({ error: 'Token requerido' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  var tokenCol = colMap['Token'];
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(params.token)) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) return respond({ error: 'Invitado no encontrado' });

  sheet.deleteRow(targetRow);

  return respond({ ok: true, mensaje: 'Invitado eliminado correctamente' });
}

// ========================================
// ADMIN — Marcar como enviada por WhatsApp
// ========================================
function adminMarkSent(params) {
  if (!params.token) return respond({ error: 'Token requerido' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  // Crear columna Enviada si no existe
  if (colMap['Enviada'] === undefined) {
    var newCol = headers.length + 1;
    sheet.getRange(1, newCol).setValue('Enviada');
    colMap['Enviada'] = headers.length;
  }

  var tokenCol = colMap['Token'];
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(params.token)) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) return respond({ error: 'Invitado no encontrado' });

  sheet.getRange(targetRow, colMap['Enviada'] + 1).setValue(true);

  return respond({ ok: true, mensaje: 'Marcado como enviada' });
}

// ========================================
// ADMIN — Resetear confirmación
// ========================================
function adminResetConfirm(params) {
  if (!params.token) return respond({ error: 'Token requerido' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  var tokenCol = colMap['Token'];
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(params.token)) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) return respond({ error: 'Invitado no encontrado' });

  sheet.getRange(targetRow, colMap['Confirmación'] + 1).setValue('');
  sheet.getRange(targetRow, colMap['Alergias'] + 1).setValue('');
  sheet.getRange(targetRow, colMap['Detalle alergias'] + 1).setValue('');

  return respond({ ok: true, mensaje: 'Confirmación reseteada. El invitado puede volver a responder.' });
}

// ========================================
// ADMIN — Obtener mensaje template
// ========================================
function adminGetMsgTemplate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('Config');
  if (!configSheet) return respond({ ok: true, template: '' });

  var data = configSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'wa_msg_template') {
      return respond({ ok: true, template: data[i][1] || '' });
    }
  }
  return respond({ ok: true, template: '' });
}

// ========================================
// ADMIN — Guardar mensaje template
// ========================================
function adminSaveMsgTemplate(params) {
  var template = params.template || '';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('Config');

  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.getRange(1, 1, 1, 2).setValues([['Clave', 'Valor']]);
  }

  var data = configSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'wa_msg_template') {
      configSheet.getRange(i + 1, 2).setValue(template);
      return respond({ ok: true, mensaje: 'Mensaje guardado' });
    }
  }

  // No existe, agregar nueva fila
  configSheet.appendRow(['wa_msg_template', template]);
  return respond({ ok: true, mensaje: 'Mensaje guardado' });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function indexOf(arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === value) return i;
  }
  return -1;
}

// Convierte valor de celda a string seguro.
// Google Sheets convierte 'TRUE'/'FALSE' a booleanos true/false,
// lo que causa que (false || '') sea '' en vez de 'FALSE'.
function cellToStr(val) {
  if (val === true) return 'TRUE';
  if (val === false) return 'FALSE';
  return String(val || '');
}

// ========================================
// AUTO-SYNC: genera tokens e IDs faltantes
// ========================================
function autoSync() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Crear columnas faltantes si no existen
  var requiredCols = ['ID', 'Invitado', 'Token', 'Confirmación', 'Alergias', 'Detalle alergias', 'Enviada'];
  for (var r = 0; r < requiredCols.length; r++) {
    if (indexOf(headers, requiredCols[r]) === -1) {
      var newCol = headers.length + 1;
      sheet.getRange(1, newCol).setValue(requiredCols[r]);
      headers.push(requiredCols[r]);
    }
  }

  // Re-leer datos con las columnas nuevas
  var data = sheet.getDataRange().getValues();
  headers = data[0];

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  var idCol = colMap['ID'];
  var invitadoCol = colMap['Invitado'];
  var tokenCol = colMap['Token'];

  if (invitadoCol === undefined) return 0;

  // Buscar max ID existente
  var maxId = 0;
  for (var i = 1; i < data.length; i++) {
    var id = parseInt(data[i][idCol]) || 0;
    if (id > maxId) maxId = id;
  }

  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var nombre = String(row[invitadoCol] || '').trim();
    if (!nombre) continue;

    // Generar ID faltante
    if (idCol !== undefined && !row[idCol]) {
      maxId++;
      sheet.getRange(i + 1, idCol + 1).setValue(maxId);
    }

    // Generar Token faltante
    if (!row[tokenCol]) {
      sheet.getRange(i + 1, tokenCol + 1).setValue(crearToken());
      count++;
    }
  }

  return count;
}

// ========================================
// ON EDIT TRIGGER: auto-genera al editar Sheet
// ========================================
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== HOJA) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Crear columna Token si no existe
  if (indexOf(headers, 'Token') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('Token');
    headers.push('Token');
  }
  if (indexOf(headers, 'ID') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('ID');
    headers.push('ID');
  }

  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[headers[c]] = c;
  }

  var tokenCol = colMap['Token'];
  var invitadoCol = colMap['Invitado'];
  var idCol = colMap['ID'];

  if (invitadoCol === undefined) return;

  // Buscar max ID
  var allData = sheet.getDataRange().getValues();
  var maxId = 0;
  for (var i = 1; i < allData.length; i++) {
    var id = parseInt(allData[i][idCol]) || 0;
    if (id > maxId) maxId = id;
  }

  // Recorrer filas editadas (soporta paste de múltiples filas)
  var startRow = e.range.getRow();
  var numRows = e.range.getNumRows();

  for (var r = startRow; r < startRow + numRows; r++) {
    if (r <= 1) continue; // saltar header

    var nombre = String(sheet.getRange(r, invitadoCol + 1).getValue() || '').trim();
    if (!nombre) continue;

    // Token faltante
    var existingToken = sheet.getRange(r, tokenCol + 1).getValue();
    if (!existingToken) {
      sheet.getRange(r, tokenCol + 1).setValue(crearToken());
    }

    // ID faltante
    if (idCol !== undefined) {
      var existingId = sheet.getRange(r, idCol + 1).getValue();
      if (!existingId) {
        maxId++;
        sheet.getRange(r, idCol + 1).setValue(maxId);
      }
    }
  }
}

// ========================================
// EJECUTAR UNA VEZ: Genera tokens únicos (legacy)
// ========================================
function generarTokens() {
  var count = autoSync();
  SpreadsheetApp.getUi().alert('Listo. Se generaron ' + count + ' tokens nuevos.');
}

function crearToken() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var token = '';
  for (var i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ========================================
// GENERA LINKS DE WHATSAPP
// ========================================
function generarLinksWhatsApp() {
  // ============================================================
  // >>> CAMBIA ESTA URL por la de tu sitio en GitHub Pages <<<
  var BASE_URL = 'https://TU-USUARIO.github.io/matrimonio-franco-natalia';
  // ============================================================

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var tokenCol = indexOf(headers, 'Token');
  var telefonoCol = indexOf(headers, 'Teléfono');
  var invitadoCol = indexOf(headers, 'Invitado');
  var acompananteCol = indexOf(headers, 'Acompañante');

  if (tokenCol === -1) {
    SpreadsheetApp.getUi().alert('Error: No se encontró la columna Token. Ejecuta generarTokens() primero.');
    return;
  }

  // Crear o limpiar hoja de links
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var linksSheet = ss.getSheetByName('Links WhatsApp');
  if (!linksSheet) {
    linksSheet = ss.insertSheet('Links WhatsApp');
  }
  linksSheet.clear();
  linksSheet.getRange(1, 1, 1, 4).setValues([['Invitado', 'Teléfono', 'Link WhatsApp', 'URL Invitación']]);

  var row = 2;
  for (var i = 1; i < data.length; i++) {
    var nombre = data[i][invitadoCol];
    var acompanante = data[i][acompananteCol] || '';
    var telefono = String(data[i][telefonoCol]).replace(/[^0-9]/g, '');
    var token = data[i][tokenCol];

    if (!telefono || !token) continue;

    var url = BASE_URL + '/?token=' + token;

    // Construir saludo personalizado
    var saludo = nombre.split(' ')[0];
    if (acompanante && acompanante.toLowerCase() !== 'pareja' && acompanante.trim() !== '') {
      saludo += ' y ' + acompanante.split(' ')[0];
    }

    var mensaje = 'Hola ' + saludo + '!\n\n'
      + 'Están cordialmente invitados al matrimonio de *Natalia & Franco*\n\n'
      + 'Viernes 1 de mayo, 2026\n'
      + '19:00 hrs\n'
      + 'Centro de Eventos Claro de Luna, San Fernando\n\n'
      + 'Confirma tu asistencia aquí:\n'
      + url;

    var waLink = 'https://wa.me/' + telefono + '?text=' + encodeURIComponent(mensaje);

    linksSheet.getRange(row, 1).setValue(nombre);
    linksSheet.getRange(row, 2).setValue(telefono);
    linksSheet.getRange(row, 3).setValue(waLink);
    linksSheet.getRange(row, 4).setValue(url);
    row++;
  }

  SpreadsheetApp.getUi().alert(
    'Listo! Se generaron ' + (row - 2) + ' links en la hoja "Links WhatsApp".\n\n'
    + 'Abre cada link de la columna C para enviar el mensaje por WhatsApp.'
  );
}
