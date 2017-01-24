// ==UserScript==
// @name           Platzi hints - Script
// @description    Script for easy pass Platzi exams
// @author         Andres Lucas <andresin87@gmail.com> (http://github.com/andresin87)
// @namespace      http://www.andreslucas.me/
// @version        0.0.1
// @icon           http://tampermonkey.net/favicon.ico
// @match          https://platzi.com/clases/*
// @grant          GM_setValue
// @grant          GM_getValue
// @run-at         document-end
// @require        https://rawgit.com/Mikhus/domurl/master/url.min.js
// @require        https://code.jquery.com/jquery-2.2.4.min.js

// ==/UserScript==

$(window).load(function() {
  console.log('TAMPERMONKEY-SCRIPT');
  var resetTamper = function(){
    sessionStorage.tamper = null;
    GM_setValue('tamper', JSON.stringify({}));
  };
  // resetTamper();
  var url = new Url(window.location.href);
  var user;
  var sStorage = {};
  var paths = url.paths();
  var mode;
  var exam;
  if (typeof(Storage) !== "undefined") {
    sStorage = JSON.parse(GM_getValue('tamper'));
    console.log(JSON.parse(localStorage.ajs_user_traits).email, sStorage);
    console.log(paths);
    user = JSON.parse(localStorage.ajs_user_traits).email;
    if (paths[0] == 'clases' && (paths[1] == 'examen' || paths[1] == 'exams')) {
      exam = paths[2];

      if (paths[3] == 'examen_usuario') {
        console.log('incio Examen!');
        mode = paths[4];
        sStorage[exam] = {title: $('h2.ExamWarning-title')[0].innerText.split('Tomar examen del ')[1]};
        sStorage[exam].icon = $('img.ExamWarning-logoBadge')[0].currentSrc;
        sessionStorage.tamper = JSON.stringify(sStorage);
        GM_setValue('tamper', sessionStorage.tamper);
      } else if (paths[3] == 'tomar_examen'){
        console.log('question page!');
        var getQuestion = function(selected) {
          console.log('getQuestion');
          if (!sStorage[exam].questions) {
            sStorage[exam].questions = {};
          }
          var question = {
            id: $('#question').data('id'),
            txt: $('#question')[0].innerText
          };
          var answers = [];
          var t = $('#answers > li.Answer');
          var v = [];
          Object.keys(t).forEach(function(k){
            if (Number.isInteger(parseInt(k))) {
              v.push(k);
            }
          });
          v.forEach(function(e){
            //console.log($(t[e]).data('id'));
            //console.log($(t[e]).children('.Answer-content')[0].innerText);
            answers.push({
              id: $(t[e]).data('id'),
              txt: $(t[e]).children('.Answer-content')[0].innerText
            });
          });
          if(!sStorage[exam]) {
            sStorage[exam] = {questions: {}};
          }
          if (!sStorage[exam].questions[question.id]) {
            sStorage[exam].questions[question.id] = {
              txt: question.txt,
              answers: {}
            };
            answers.forEach(function(e){
              sStorage[exam].questions[question.id].answers[e.id] = {
                txt: e.txt
              };
              if (e.id == selected) {
                sStorage[exam].questions[question.id].answers[e.id].selected = true;
              }
            });
          }
          sessionStorage.tamper = JSON.stringify(sStorage);
          GM_setValue('tamper', sessionStorage.tamper);
          setTimeout(function(){ location.reload(); }, 1500);
        };
        $('.Actions button').on('click', function(e){
          console.log('action!');
          var selected = $('.Answer.is-selected').data('id');
          getQuestion(selected);
        });
      }  else if (paths[3] == 'exam_result') {
        console.log('exam_result');
        var questions = $('li.QuestionItem', 'ul.Questions-list');
        Object.keys(questions).forEach(function(e) {
          if (!isNaN(parseInt(e)) && isFinite(e)) {
            elem = {};
            elem.qry = $(questions[e], 'ul.Questions-list');
            if(elem.qry.hasClass('Incorrect')) elem.status = 'Incorrect';
            if(elem.qry.hasClass('Correct')) elem.status = 'Correct';
            elem.qrytxt = elem.qry.children('.QuestionItem-text');
            elem.txt = elem.qrytxt[0].innerText;
            var q = Object.keys(sStorage[paths[2]].questions).map(function(i){
              return sStorage[paths[2]].questions[i];
            }).filter(function(e){
              return e.txt == elem.txt;
            });
            elem.qrytxt.css('color','black');
            if (elem.status === 'Incorrect') {
              elem.qrytxt.css('background-color','rgba(255,20,0,0.5)');
            }
            if (elem.status === 'Correct') {
              elem.qrytxt.css('background-color','rgba(200,255,255,0.5)');
            }
            console.log(elem.status);
            if (q.length) {
              q.forEach(function(c){
                Object.keys(c.answers).forEach(function(a){
                  var str = '<div style="font-size:.8em;';
                  if (c.answers[a].selected) {
                    str += 'font-weight:bold;';
                    if (elem.status === 'Incorrect') {
                      c.answers[a].value = false;
                    } else if (elem.status === 'Correct') {
                      c.answers[a].value = true;
                    }
                  }
                  str += '"';
                  str += '> • ' + c.answers[a].txt + '</div>';
                  elem.qrytxt.append(str);
                });
              });
            }
          }
        });
      }
      console.log(sStorage);
    }
  } else {
    // Sorry! No Web Storage support..
    console.log('Sorry! No Web Storage support');
  }
});

