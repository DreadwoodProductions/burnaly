local function checkKillSwitch()
    local request = (syn and syn.request) or (http and http.request) or (http_request) or (fluxus and fluxus.request) or request
    
    local response = request({
        Url = "https://burnaly.com/.netlify/functions/killswitch",
        Method = "GET"
    })
    
    if response.Success then
        local data = game:GetService("HttpService"):JSONDecode(response.Body)
        return data.status == "true"
    end
    return true
end

while true do
    local serverEnabled = checkKillSwitch()
    
    if not serverEnabled then
        game.Players.LocalPlayer:Kick("Server has been disabled until further notice.")
        break
    end
    
    task.wait(5)
end
