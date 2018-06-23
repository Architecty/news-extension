require()

(setPage());

var login = document.forms.namedItem("login");

//
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs){
  document.getElementById('url').value = tabs[0].url;
  document.getElementById('title').value = tabs[0].title;
})

login.addEventListener('submit', function(event) {
  event.preventDefault();
  var oReq = new XMLHttpRequest(),
    username = document.getElementById('username').value,
    password = document.getElementById('password').value;

  oReq.open("POST", baseURL + "/login");
  oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  oReq.onload = function (oEvent) {
    console.log(oReq)
    if (oReq.status === 200) {
      var response = JSON.parse(oReq.response);
      chrome.storage.sync.set({
        token: response.token,
        username: response.username
      }, function () {
        setPage()
      });

    } else {
      alert("Username or Password is incorrect! Please check and try again")
    }
  };
  oReq.send(["username=", username, "&password=", password].join(''))
})

document.getElementById('logoutButton').addEventListener('click', function(){
  chrome.storage.sync.remove('token', function(){setPage()})
})

document.getElementById('addComment').addEventListener('click', function(){
  var newTextarea = document.createElement("TEXTAREA");
  newTextarea.classList.add('comment');

  document.getElementById('comments').appendChild(newTextarea)
})



document.getElementById('addToQueue').addEventListener('click', function(){
  chrome.storage.sync.get(['token'], function(result){
    if(result){
      var data = {
        token: result.token,
        url:  document.getElementById('url').value,
        title:  document.getElementById('title').value,
        comments: [].slice.call(document.getElementsByClassName('comment'))
          .map(function(val){return val.value})
          .filter(function(val){return val})
      };

      var oReq = new XMLHttpRequest();

      oReq.open("POST", baseURL + "/queue");
      oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      oReq.onload = function(oEvent) {
        if (oReq.status !== 200) {
          alert("It Broke!", oReq.response);
        }
      };
      oReq.send(JSON_to_URLEncoded(data));
    }
  });
})

function JSON_to_URLEncoded(element,key,list){
  list = list || [];
  if(typeof(element)==='object'){
    for (var idx in element)
      JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list);
  } else {
    list.push(key+'='+encodeURIComponent(element));
  }
  return list.join('&');
}

//Set if we should see a log-in page, a post page
function setPage(){
  chrome.storage.sync.get(['token'], function(result){
    document.getElementById(result.token ? 'loginPage' : 'mainPage').classList.add('hidden');
    document.getElementById(result.token ? 'mainPage' : 'loginPage').classList.remove('hidden');
  });
}