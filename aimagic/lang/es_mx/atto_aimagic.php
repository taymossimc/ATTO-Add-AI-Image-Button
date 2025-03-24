<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Strings for component 'atto_aimagic', language 'es_mx'.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'Magia IA';
$string['settings'] = 'Configuración de Magia IA';
$string['inserttextprompt'] = 'Insertar contenido generado por IA';
$string['dialogtitle'] = '¿Qué puedo crear para ti?';
$string['promptlabel'] = 'Tu solicitud:';
$string['generatebutton'] = 'Generar Contenido';
$string['cancel'] = 'Cancelar';
$string['processing'] = 'Generando contenido, por favor espera...';
$string['error'] = 'Ha ocurrido un error. Por favor intenta de nuevo.';
$string['useprompt'] = 'Usar este mensaje';
$string['replacecontent'] = 'Reemplazar contenido seleccionado';
$string['addcontent'] = 'Añadir al contenido seleccionado';
$string['insertionmodelabel'] = 'Modo de Inserción';

// Settings page strings
$string['apikey'] = 'Clave API de OpenAI';
$string['apikey_desc'] = 'Tu clave API de OpenAI para acceder a la API de Agentes';
$string['assistantid'] = 'ID de Asistente de OpenAI';
$string['assistantid_desc'] = 'El ID del Asistente de OpenAI que se utilizará para generar contenido';
$string['baseurl'] = 'URL Base de la API';
$string['baseurl_desc'] = 'La URL base para la API de OpenAI (cambiar solo si se utiliza un punto final personalizado)';
$string['timeout'] = 'Tiempo de espera de la solicitud';
$string['timeout_desc'] = 'Tiempo máximo en segundos para esperar la respuesta de la API';

// Test connection strings
$string['testconnectionheading'] = 'Probar Conexión';
$string['testconnection'] = 'Probar Conexión a OpenAI';
$string['testconnection_success'] = '¡Conexión exitosa!';
$string['testconnection_error'] = 'La conexión falló:';
$string['testconnection_testing'] = 'Probando conexión...';
$string['testconnection_assistant_valid'] = 'ID del Asistente es válido';
$string['testconnection_assistant_invalid'] = 'ID del Asistente es inválido o no se encontró';
$string['testconnection_apikey_missing'] = 'La Clave API no existe o es inválida';
$string['testconnection_assistant_missing'] = 'Falta el ID del Asistente';
$string['test_success_popup'] = 'Prueba Exitosa: Estás Conectado a OpenAI';
$string['test_error_popup'] = 'Prueba Fallida: Revisa tus Claves';

// Privacy
$string['privacy'] = 'Privacidad';
$string['privacy_desc'] = 'Descripción de la política de privacidad';
$string['privacy_policy'] = 'Política de Privacidad';
$string['privacy_policy_desc'] = 'Contenido de la política de privacidad';
$string['privacy_policy_link'] = 'Enlace a la política de privacidad';
$string['privacy_policy_link_desc'] = 'Enlace a la política de privacidad';
$string['privacy_policy_link_text'] = 'Leer Política de Privacidad';
$string['privacy_policy_link_text_desc'] = 'Texto para el enlace de la política de privacidad';
$string['privacy_policy_link_text_default'] = 'Leer Política de Privacidad';
$string['privacy_policy_link_text_default_desc'] = 'Texto predeterminado para el enlace de la política de privacidad';
$string['privacy:metadata:atto_aimagic'] = 'El plugin Atto Magia IA no almacena ningún dato personal, pero transmite el contenido ingresado por el usuario a la API de OpenAI para su procesamiento.';
$string['privacy:metadata:atto_aimagic:prompt'] = 'El mensaje de texto ingresado por el usuario se envía a la API de OpenAI para la generación de contenido.';
$string['privacy:metadata:atto_aimagic:selection'] = 'Si se selecciona texto al usar Magia IA, esta selección se envía a la API de OpenAI para contexto.';
$string['privacy:metadata:atto_aimagic:userid'] = 'Su ID de usuario no se envía a la API externa, pero se registra en los registros del sistema de Moodle cuando utiliza la función Magia IA.'; 