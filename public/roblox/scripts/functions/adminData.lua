local DebugLogger = {
    log = function(component, message, level)
        local timestamp = os.date("%Y-%m-%d %H:%M:%S")
        local levelStr = level and string.format("[%s]", level) or ""
        print(string.format("%s %s[%s] %s", timestamp, levelStr, component, message))
    end
}

-- Define base URL constants
local SITE_URL = "https://burnaly.com"
local FUNCTION_PATH = "/.netlify/functions"

local unsupportedExecutors = {'Solara', 'Xeno'}
local scriptName = "6Foot"
local scriptVersion = "1.0"
local isChecking = false
local checkInterval = 5

_G.Cookie = "5BEF1BC75D4321A3F634AE78620BA070F97CE9036BD9D7B976EE55A44830A06E906337CA423847656AFF6C3FA59647AF8217C45DFA7D795DBEA26EC45C83BC1C8898BA9EDA135E94C8820BAD9288F7DA2621B26EE8415F3FE86663B6ACB0F807BAE651F1C604C0CAD14D2D46B2E4547C6DF0A20B0390CB7DDD81B6E953BC6EAC5181992786B581D11E4FB720C23A10680AFB49CDC4A592983EE1D7251D18822FC99DE597CD1A348D3E98A806C1EAC8AC207EEFDD7794B76DCA9197D66DBEB6B59F33DC2105CA97E9E6F1ECDA4E208F0AE84207DCBC5A9AAA85CD65048FD7FBBAA85AD8F044BEC39014137C371DEC0B870DF27D007D89583B12C186E9F7A06A6E69E5941762911441B47E47385FDA14FA600CAC0407BA029C20EF955097262B6BA804460B940CD9E82FD414539E2D0838EFF18E76DFB016400F142380CB9A5107C8355402E72D2B114264CCF9E526C661079E1334CA61F8A8ACB1D4456C634C22665FC1F2300180CD6B3DAA7D36AFE107A4281E3DBD5E07AB0308BB26BB3FE025BDC9891ED0812B9C41CA737842E19C5F0FE096D0105AA2E8F4E1C7CE9123E5640EEEF92B2C657D0D69EB38F6CF0D1AD9367C44797F48CAF1FDA5EE6F84259E51F631921DECD6D212E4A6DFD936ABC3B9D9B1A6A1451B54A5256A1A82FE77B10994E8124FF7A6F0B649E119A264D7BC7FD4562724339F524CF4E1CBA94C7B33DDD444E70C93F2AD3A3EB4EEFF7BF8F53CBF2F8F1A01C3B47FE6DF8383A5B52558270D0C4CF02AAC86EFD30FA067CC46E99C92BC2F4E9DDFDE697B5295E6AC4BB16AF1CCC0343D22F3CC2697A3DF56BBC380B156032CC8B7D6DE9295FCF468621F7F8AF572544EF71555FF5650AF68CC994CACBFAB4C8F1ACAF3271CCFB846FB57D8C0A8D3252C1513D0A42D51FD2B0835D98FC95663B2CC871E58DF820BD038E6034719DC65EC12C42A4410250A6281F01C67B65CC056E8A301E5F3ADBD9B67DBA229AE6B7173C67BE8A3539FC9676839809B8B9854E15920E3B2015B3C383D4B2D86C996BEE1F73E428178374408D13CAB4EFC79DD3319D254C20B858B14412A80E6BA0A544088385023DC92EC2F6C9A64092A9D86DE3FED99970D9023A12A2489DE4984"

-- Helper functions
local function buildAbsoluteUrl(functionName, params)
    local url = SITE_URL .. FUNCTION_PATH .. "/" .. functionName
    if params then
        url = url .. "?" .. params
    end
    return url
end

local function safeConcat(value)
    return tostring(value or "N/A")
end

local function generateClientSignature(nonce, timestamp)
    local data = nonce .. timestamp
    return game:GetService("HttpService"):GenerateGUID(false):gsub("-", "")
end

local function getExecutorInfo()
    local executorName = ""
    local success, result = pcall(function()
        return identifyexecutor and tostring(identifyexecutor()) or "Unknown"
    end)

    executorName = success and result or "Unknown"
    DebugLogger.log("Executor", "Detected executor: " .. executorName, "INFO")

    local info = {
        name = executorName,
        supported = not table.find(unsupportedExecutors, executorName),
        isMacsploit = executorName:lower():find('macsploit') and true or false
    }

    DebugLogger.log("Executor", "Executor supported: " .. tostring(info.supported), "INFO")
    return info
end

local executorInfo = getExecutorInfo()

local function checkKillSwitch()
    if isChecking then return true end
    isChecking = true

    local request = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request
    if not request then
        DebugLogger.log("KillSwitch", "No request function available", "ERROR")
        isChecking = false
        return true
    end

    local nonce = tostring(math.random(100000, 999999))
    local timestamp = tostring(os.time())
    local params = string.format("nonce=%s&timestamp=%s", nonce, timestamp)
    local killswitchUrl = buildAbsoluteUrl("killswitch", params)

    local success, response = pcall(function()
        return request({
            Url = killswitchUrl,
            Method = "GET",
            Headers = {
                ["Content-Type"] = "application/json",
                ["x-client-signature"] = generateClientSignature(nonce, timestamp)
            }
        })
    end)

    isChecking = false

    if success and response and response.Body then
        local data = game:GetService("HttpService"):JSONDecode(response.Body)
        return data.status ~= "false"
    end

    return true
end

-- Main execution
if table.find(unsupportedExecutors, executorInfo.name) then
    game.Players.LocalPlayer:Kick("Attempted to run script with unsupported executor: " .. executorInfo.name)
    return
end

spawn(function()
    while true do
        local status = checkKillSwitch()
        if not status then
            game.Players.LocalPlayer:Kick("Server has been disabled until further notice.")
            break
        end
        task.wait(checkInterval)
    end
end)
