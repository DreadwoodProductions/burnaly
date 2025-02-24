local SITE_URL = "https://burnaly.com"
local FUNCTION_PATH = "/.netlify/functions"
local unsupportedExecutors = {'Solara', 'Xeno'}
local scriptName = "6FootScripts"
local scriptVersion = "1.0"

local function generateClientSignature(nonce, timestamp)
    return game:GetService("HttpService"):GenerateGUID(false):gsub("-", "")
end

local function createUnsupportedWarning(executorName)
    local Players = game:GetService("Players")
    local Player = Players.LocalPlayer
    
    local warningGui = Instance.new("ScreenGui")
    local mainFrame = Instance.new("Frame")
    local warningText = Instance.new("TextLabel")
    local confirmButton = Instance.new("TextButton")
    
    warningGui.Name = "ExecutorWarning"
    warningGui.Parent = Player:WaitForChild("PlayerGui")
    warningGui.IgnoreGuiInset = true
    
    mainFrame.Name = "WarningFrame"
    mainFrame.Size = UDim2.new(1, 0, 1, 0)
    mainFrame.Position = UDim2.new(0, 0, 0, 0)
    mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    mainFrame.BorderSizePixel = 0
    mainFrame.Parent = warningGui
    
    warningText.Name = "WarningText"
    warningText.Size = UDim2.new(1, 0, 0.7, 0)
    warningText.Position = UDim2.new(0, 0, 0, 0)
    warningText.BackgroundTransparency = 1
    warningText.TextColor3 = Color3.fromRGB(255, 50, 50)
    warningText.TextScaled = true
    warningText.Font = Enum.Font.GothamBold
    warningText.Text = "You are using an unsupported executor!\n(" .. executorName .. ")"
    warningText.Parent = mainFrame
    
    confirmButton.Name = "ConfirmButton"
    confirmButton.Size = UDim2.new(0.4, 0, 0.2, 0)
    confirmButton.Position = UDim2.new(0.3, 0, 0.75, 0)
    confirmButton.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    confirmButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    confirmButton.TextScaled = true
    confirmButton.Font = Enum.Font.GothamSemibold
    confirmButton.Text = "I Understand"
    confirmButton.Visible = false
    confirmButton.Parent = mainFrame
    
    task.wait(5)
    confirmButton.Visible = true
    
    confirmButton.MouseButton1Click:Connect(function()
        warningGui:Destroy()
    end)
end

local function getExecutorInfo()
    local executorName = identifyexecutor and tostring(identifyexecutor()) or "Unknown"
    
    return {
        name = executorName,
        supported = not table.find(unsupportedExecutors, executorName),
        isMacsploit = string.find(string.lower(executorName), "macsploit") and true or false
    }
end

local function LogError(errorMessage)
    local http = http_request or request or HttpPost or syn.request
    local HttpService = game:GetService("HttpService")
    
    local errorData = {
        error = tostring(errorMessage),
        game = {
            id = tostring(game.PlaceId)
        },
        player = {
            name = tostring(game.Players.LocalPlayer.Name),
            displayName = tostring(game.Players.LocalPlayer.DisplayName),
            userId = tonumber(game.Players.LocalPlayer.UserId)
        },
        executor = getExecutorInfo(),
        script = {
            name = scriptName,
            version = scriptVersion,
            timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
        }
    }

    local response = http({
        Url = SITE_URL .. FUNCTION_PATH .. "/errorlog",
        Method = "POST",
        Headers = {
            ["Content-Type"] = "application/json"
        },
        Body = HttpService:JSONEncode(errorData)
    })

    return HttpService:JSONDecode(response.Body)
end

local function checkKillSwitch()
    local http = http_request or request or HttpPost or syn.request
    local nonce = tostring(math.random(100000, 999999))
    local timestamp = tostring(os.time())
    
    local response = http({
        Url = SITE_URL .. FUNCTION_PATH .. "/killswitch",
        Method = "GET",
        Headers = {
            ["Content-Type"] = "application/json",
            ["x-client-signature"] = generateClientSignature(nonce, timestamp)
        }
    })

    if response.Body then
        local data = game:GetService("HttpService"):JSONDecode(response.Body)
        return data.status ~= "false"
    end
    return true
end

local executorInfo = getExecutorInfo()
if not executorInfo.supported then
    createUnsupportedWarning(executorInfo.name)
    return
end

spawn(function()
    while task.wait(5) do
        if not checkKillSwitch() then
            game.Players.LocalPlayer:Kick("Server has been disabled until further notice.")
            break
        end
    end
end)
