local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()
local PlayerPet = require(Services.ReplicatedStorage.Library.Client.PlayerPet)

local Breakables = {
    BREAKABLE_TYPES = {
        "Small Coins", "Large Coins", "Crate", "Present",
        "Safe", "Vault", "Coin Minichest", "Coin Chest"
    },
    
    _cache = {
        lastUpdate = 0,
        breakables = {}
    }
}

function Breakables:init()
    Services.Workspace.__THINGS.Breakables.ChildAdded:Connect(function()
        self:updateCache()
    end)
    
    Services.Workspace.__THINGS.Breakables.ChildRemoved:Connect(function()
        self:updateCache()
    end)
end

function Breakables:updateCache()
    local currentTime = tick()
    if currentTime - self._cache.lastUpdate < 1 then return end
    
    self._cache.breakables = {}
    for _, breakable in ipairs(Services.Workspace.__THINGS.Breakables:GetChildren()) do
        local breakableId = breakable:GetAttribute("BreakableID")
        if table.find(self.BREAKABLE_TYPES, breakableId) then
            table.insert(self._cache.breakables, breakable)
        end
    end
    
    self._cache.lastUpdate = currentTime
end

function Breakables:getNearest()
    local character = Services.Players.LocalPlayer.Character
    if not character then return nil end
    
    local rootPart = character:FindFirstChild("HumanoidRootPart")
    if not rootPart then return nil end
    
    local nearest = nil
    local minDistance = math.huge
    
    for _, breakable in ipairs(self:getBreakables()) do
        local distance = (breakable.Position - rootPart.Position).Magnitude
        if distance < minDistance then
            minDistance = distance
            nearest = breakable
        end
    end
    
    return nearest
end

function Breakables:getBreakables()
    if tick() - self._cache.lastUpdate > 1 then
        self:updateCache()
    end
    return self._cache.breakables
end

function Breakables:autoBreakables()
    local pets = PlayerPet.GetByPlayer()
    if #pets == 0 then return end
    
    local nearest = self:getNearest()
    if nearest then
        for _, pet in pairs(pets) do
            pet:SetTarget(nearest)
        end
    end
end

Breakables:init()
return Breakables
