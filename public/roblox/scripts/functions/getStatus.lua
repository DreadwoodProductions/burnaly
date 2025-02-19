local function generateNonce()
    local charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    local nonce = ""
    for i = 1, 32 do
        local rand = math.random(1, #charset)
        nonce = nonce .. string.sub(charset, rand, rand)
    end
    return nonce
end

local function checkKillSwitch()
    local request = (syn and syn.request) or (http and http.request) or (http_request) or (fluxus and fluxus.request) or request
    
    local nonce = generateNonce()
    local timestamp = os.time()
    
    local response = request({
        Url = string.format("https://burnaly.com/.netlify/functions/killswitch?nonce=%s&timestamp=%d", nonce, timestamp),
        Method = "GET",
        Headers = {
            ["x-client-signature"] = game:GetService("HttpService"):GenerateGUID(false)
        }
    })
    
    if response.Success then
        local data = game:GetService("HttpService"):JSONDecode(response.Body)
        
        -- Verify response integrity
        if not data.serverSignature or 
           not data.timestamp or 
           not data.nonce or 
           math.abs(os.time() - data.timestamp) > 30 or
           data.nonce ~= nonce then
            print("Security verification failed")
            return true
        end
        
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
