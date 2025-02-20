local unsupportedExecutors = {'Solara', 'Xeno'}
local scriptName = "6Foot"
local scriptVersion = "1.0"

local function getExecutorInfo()
    local executorName = identifyexecutor and tostring(identifyexecutor()) or "Unknown"
    return {
        name = executorName,
        supported = not table.find(unsupportedExecutors, executorName),
        isMacsploit = executorName:lower():find('macsploit') and true or false
    }
end

local function LogError(errorMessage)
    local http_request = http_request or request or HttpPost or syn.request
    local executorInfo = getExecutorInfo()
    
    local response = http_request({
        Url = "https://burnaly.com/.netlify/functions/errorlog",
        Method = "POST",
        Headers = {
            ["Content-Type"] = "application/json"
        },
        Body = game:GetService("HttpService"):JSONEncode({
            error = errorMessage,
            game = {
                id = game.PlaceId,
                name = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name
            },
            player = {
                name = game.Players.LocalPlayer.Name,
                displayName = game.Players.LocalPlayer.DisplayName,
                userId = game.Players.LocalPlayer.UserId
            },
            executor = executorInfo,
            script = {
                name = scriptName,
                version = scriptVersion,
                timestamp = os.date("%Y-%m-%d %H:%M:%S")
            }
        })
    })
    
    return response.Body
end

local function checkKillSwitch()
    local request = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request
    
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

if table.find(unsupportedExecutors, getExecutorInfo().name) then
    warn('[6Foot] Unsupported Executor')
    LogError("Attempted to run script with unsupported executor: " .. getExecutorInfo().name)
    return
end

while true do
    local serverEnabled = checkKillSwitch()
    
    if not serverEnabled then
        LogError("Script disabled by killswitch")
        game.Players.LocalPlayer:Kick("Server has been disabled until further notice.")
        break
    end
    
    task.wait(5)
end
