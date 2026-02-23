chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("Extensions install");
        chrome.tabs.create({url: "https://itog.by/bootcamp/converter/welcome.php"});
    }
});
