YUI.add("moodle-atto_template-button",function(e,t){var a="atto_template",n="atto_template",i={TILES:"tiles",OUTCOMES:"outcomes"},s={tiles:"tiles",outcomes:"outcomes"},o={INPUTSUBMIT:"atto_template_submit",INPUTCANCEL:"atto_template_cancel",TEMPLATENAME:"atto_template_name"},l={TEMPLATES:".atto_template_option"};e.namespace("M.atto_template").Button=e.Base.create("button",e.M.editor_atto.EditorPlugin,[],{_currentSelection:null,_templates:null,initializer:function(){this.addButton({icon:"e/template",iconComponent:"core",buttonName:"template",callback:this._displayDialogue,title:"insertemplate"}),this._loadTemplates()},_loadTemplates:function(){this._templates={tiles:M.cfg.wwwroot+"/lib/editor/atto/plugins/template/templates/tiles.html",outcomes:M.cfg.wwwroot+"/lib/editor/atto/plugins/template/templates/outcomes.html"}},_displayDialogue:function(){if(this._currentSelection=this.get("host").getSelection(),!1!==this._currentSelection){var t=this.getDialogue({headerContent:M.util.get_string("dialogtitle",a),width:"800px",focusAfterHide:!0}),n=this._getDialogueContent();t.set("bodyContent",n),t.show()}},_getDialogueContent:function(){var t=e.Handlebars.compile('<div class="atto_template_selector"><div><div class="atto_template_option" data-template="{{TILES}}"><div class="atto_template_name">{{tilestemplate}}</div></div><div class="atto_template_option" data-template="{{OUTCOMES}}"><div class="atto_template_name">Outcomes Template</div></div></div><div class="mdl-align"><br/><button class="{{CSS.INPUTSUBMIT}}">{{insertbutton}}</button> <button class="{{CSS.INPUTCANCEL}}">{{cancel}}</button></div></div>'),n=e.Node.create(t({CSS:o,TILES:i.TILES,OUTCOMES:i.OUTCOMES,tilestemplate:M.util.get_string("tilestemplate",a),insertbutton:M.util.get_string("insertemplate",a),cancel:M.util.get_string("cancel",a)}));return n.all(l.TEMPLATES).each(function(e){e.on("click",function(t){t.preventDefault(),n.all(l.TEMPLATES).removeClass("selected"),e.addClass("selected")},this)},this),n.one("."+o.INPUTSUBMIT).on("click",function(e){e.preventDefault();var t=n.one(l.TEMPLATES+".selected").getData("template");this._insertTemplate(t),this.getDialogue({focusAfterHide:null}).hide()},this),n.one("."+o.INPUTCANCEL).on("click",function(e){e.preventDefault(),this.getDialogue({focusAfterHide:null}).hide()},this),n},_insertTemplate:function(e){var t="";e===i.TILES?t=this._getTilesTemplate():e===i.OUTCOMES&&(t=this._getOutcomesTemplate()),this.get("host").setSelection(this._currentSelection),this.get("host").insertContentAtFocusPoint(t),this.markUpdated()},_getTilesTemplate:function(){return'<h3>Overview</h3>\n<div class="block-theme-widget container">\n    <div class="theme-cards row">\n        <div class="col-6 col-lg-4 mb-4">\n            <div class="card card-bg-light">\n                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2842%29.png" alt="" role="presentation" class="img-fluid">\n                <div class="card-body">\n                    <h5 class="card-title">Why Hybrid Worship?</h5>\n                    <p class="card-text">A talk from Tay that gives the basic overview of the world of church and social media, looking into some basic theological considerations.</p>\n                </div>\n                <div class="card-footer">\n                    <a href="#section-1" class="btn btn-secondary btn-block rounded">View Module</a>\n                </div>\n            </div>\n        </div>\n        <div class="col-6 col-lg-4 mb-4">\n            <div class="card card-bg-light">\n                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2847%29.png" alt="" role="presentation" class="img-fluid">\n                <div class="card-body">\n                    <h5 class="card-title">The Basic Pieces of Hybrid Worship</h5>\n                    <p class="card-text">A Hybrid Worship Glossary of important terms and concepts.&nbsp;</p>\n                </div>\n                <div class="card-footer">\n                    <a href="#section-2" class="btn btn-secondary btn-block rounded">View Module</a>\n                </div>\n            </div>\n        </div>\n        <div class="col-6 col-lg-4 mb-4">\n            <div class="card card-bg-light">\n                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2841%29.png" alt="" role="presentation" class="img-fluid">\n                <div class="card-body">\n                    <h5 class="card-title"></h5>\n                    <h5>Methods of Providing Hybrid Worship</h5>\n                    <p class="card-text">Three case studies that show different set-ups for livestreaming worship.&nbsp;</p>\n                </div>\n                <div class="card-footer">\n                    <a href="#section-3" class="btn btn-secondary btn-block rounded">View Module</a>\n                </div>\n            </div>\n        </div>\n        <div class="col-6 col-lg-4 mb-4">\n            <div class="card card-bg-light">\n                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2839%29.png" alt="" role="presentation" class="img-fluid">\n                <div class="card-body">\n                    <h5 class="card-title">Assessing Your Context</h5>\n                    <p class="card-text">Three activities that will give you knowledge of the equipment, people, and procedures for you hybrid worship.</p>\n                </div>\n                <div class="card-footer">\n                    <a href="#section-4" class="btn btn-secondary btn-block rounded">View Module</a>\n                </div>\n            </div>\n        </div>\n        <div class="col-6 col-lg-4 mb-4">\n            <div class="card card-bg-light">\n                <img src="https://3rdwavemedia.com/demo-images/slides/maker-module-3.jpg" alt="image">\n                <div class="card-body">\n                    <h5 class="card-title">Designing for Resiliency</h5>\n                    <p class="card-text">A talk from Tay answering how to design a resilient setup, with some extra problem solving strategies you can use.</p>\n                </div>\n                <div class="card-footer">\n                    <a href="#section-5" class="btn btn-secondary btn-block rounded">View Module</a>\n                </div>\n            </div>\n        </div>\n        <div class="col-6 col-lg-4 mb-4">\n            <div class="card card-bg-light">\n                <img src="https://churchx.ca/draftfile.php/94/user/draft/12957479/LIFT%20%2846%29.png" alt="" role="presentation" class="img-fluid">\n                <div class="card-body">\n                    <h5 class="card-title">Putting it all together</h5>\n                    <p class="card-text">Some useful tips that help during the troubleshooting process.</p>\n                </div>\n                <div class="card-footer">\n                    <a href="#section-6" class="btn btn-secondary btn-block rounded">View Module</a>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<h3>Let\'s Get Started!</h3>'},_getOutcomesTemplate:function(){return'<div class="outcomes-container">\n    <h3>Learning Outcomes</h3>\n    <div class="outcomes-list">\n        <p>After completing this module, you will be able to:</p>\n        <ul>\n            <li>Outcome 1</li>\n            <li>Outcome 2</li>\n            <li>Outcome 3</li>\n        </ul>\n    </div>\n</div>'}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]}); 