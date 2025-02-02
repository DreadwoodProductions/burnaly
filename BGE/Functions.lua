local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local BubbleService = ReplicatedStorage:WaitForChild("Assets"):WaitForChild("Modules"):WaitForChild("BubbleService")
 
local Functions = {}
 
local function BlowBubble()
    if BubbleService then
        ReplicatedStorage.RemoteEvent:FireServer("BlowBubble")
    end
end
 
local function CollectCandyLand()
    local candyLand = workspace.PickupSpawns["Candy Land"]
    local player = Players.LocalPlayer
 
    -- Create a function to collect a single item
    local function collectItem(item)
        local character = player.Character
        local humanoidRootPart = character and character:FindFirstChild("HumanoidRootPart")
 
        if not humanoidRootPart then return end
 
        local touchPart
        if item:FindFirstChild("TouchPart") and item.TouchPart:FindFirstChild("TouchInterest") then
            touchPart = item.TouchPart
        elseif item:FindFirstChild("Part") and item.Part:FindFirstChild("TouchInterest") then
            touchPart = item.Part
        end
 
        if touchPart then
            firetouchinterest(humanoidRootPart, touchPart, 0)
            task.wait()
            firetouchinterest(humanoidRootPart, touchPart, 1)
        end
    end
 
    -- Collect existing items
    for _, item in pairs(candyLand:GetChildren()) do
        collectItem(item)
    end
 
    -- Set up a connection to collect new items as they spawn
    local connection
    connection = candyLand.ChildAdded:Connect(function(newItem)
        task.wait() -- Wait a short time to ensure the item is fully loaded
        collectItem(newItem)
    end)
 
    -- Run the collection loop for a set duration (e.g., 60 seconds)
    local duration = 60
    task.delay(duration, function()
        if connection then
            connection:Disconnect()
        end
    end)
end

local function PurchaseEgg(eggType)
    ReplicatedStorage.RemoteEvent:FireServer("PurchaseEgg", eggType, "Multi")
end

local function CreateCooldownHandler(action, cooldownTime)
    local canExecute = true
    return function(...)
        if canExecute then
            canExecute = false
            action(...)
            task.wait(cooldownTime)
            canExecute = true
        end
    end
end

Functions.blowBubble = CreateCooldownHandler(BlowBubble, 0.1)
Functions.CollectCandyLand = CreateCooldownHandler(CollectCandyLand, 0.1)
Functions.purchaseEgg = CreateCooldownHandler(PurchaseEgg, 0.1)

return Functions
