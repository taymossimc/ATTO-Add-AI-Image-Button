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
 * Strings for component 'atto_aimagic', language 'fr_ca'.
 *
 * @package    atto_aimagic
 * @copyright  2025 CHURCHx
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = 'Magie IA';
$string['settings'] = 'Paramètres de Magie IA';
$string['inserttextprompt'] = 'Insérer du contenu généré par IA';
$string['dialogtitle'] = 'Que puis-je créer pour vous?';
$string['promptlabel'] = 'Votre demande:';
$string['generatebutton'] = 'Générer du contenu';
$string['cancel'] = 'Annuler';
$string['processing'] = 'Génération de contenu, veuillez patienter...';
$string['error'] = 'Une erreur est survenue. Veuillez réessayer.';
$string['useprompt'] = 'Utiliser cette invite';

// Settings page strings
$string['apikey'] = 'Clé API OpenAI';
$string['apikey_desc'] = 'Votre clé API OpenAI pour accéder à l\'API des Assistants';
$string['agentid'] = 'ID d\'Assistant OpenAI';
$string['agentid_desc'] = 'L\'ID de l\'Assistant OpenAI à utiliser pour générer du contenu';
$string['baseurl'] = 'URL de base de l\'API';
$string['baseurl_desc'] = 'L\'URL de base pour l\'API OpenAI (à modifier uniquement si vous utilisez un point de terminaison personnalisé)';
$string['timeout'] = 'Délai d\'attente de la demande';
$string['timeout_desc'] = 'Temps maximum en secondes pour attendre la réponse de l\'API';

// Test connection strings
$string['testconnectionheading'] = 'Tester la Connexion';
$string['testconnection'] = 'Tester la Connexion à OpenAI';
$string['testconnection_success'] = 'Connexion réussie!';
$string['testconnection_error'] = 'La connexion a échoué:';
$string['testconnection_testing'] = 'Test de connexion en cours...';
$string['testconnection_assistant_valid'] = 'ID d\'Assistant est valide';
$string['testconnection_assistant_invalid'] = 'ID d\'Assistant est invalide ou introuvable';
$string['testconnection_apikey_missing'] = 'Clé API manquante ou invalide';
$string['testconnection_assistant_missing'] = 'ID d\'Assistant manquant';

// Privacy
$string['privacy:metadata:atto_aimagic'] = 'Le plugin Atto Magie IA ne stocke aucune donnée personnelle, mais transmet le contenu saisi par l\'utilisateur à l\'API OpenAI pour traitement.';
$string['privacy:metadata:atto_aimagic:prompt'] = 'Le texte saisi par l\'utilisateur est envoyé à l\'API OpenAI pour la génération de contenu.';
$string['privacy:metadata:atto_aimagic:selection'] = 'Si du texte est sélectionné lors de l\'utilisation de Magie IA, cette sélection est envoyée à l\'API OpenAI pour contexte.';
$string['privacy:metadata:atto_aimagic:userid'] = 'Votre ID utilisateur n\'est pas envoyé à l\'API externe mais est enregistré dans les journaux système de Moodle lorsque vous utilisez la fonctionnalité Magie IA.'; 