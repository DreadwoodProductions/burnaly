local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()
local PlayerPet = require(Services.ReplicatedStorage.Library.Client.PlayerPet)

return {
    BREAKABLE_TYPES = {
        "Small Coins", "Large Coins", "Crate", "Present",
        "Safe", "Vault", "Coin Minichest", "Coin Chest"
    },
    
    autoBreakables = function()
        for _, breakable in ipairs(Services.Workspace.__THINGS.Breakables:GetChildren()) do
            local breakableId = breakable:GetAttribute("BreakableID")
            if table.find(BREAKABLE_TYPES, breakableId) then
                for _, pet in pairs(PlayerPet.GetByPlayer()) do
                    pet:SetTarget(breakable)
                end
                break
            end
        end
    end,
    
    getBreakables = function()
        local breakables = {}
        for _, breakable in ipairs(Services.Workspace.__THINGS.Breakables:GetChildren()) do
            local breakableId = breakable:GetAttribute("BreakableID")
            if table.find(BREAKABLE_TYPES, breakableId) then
                table.insert(breakables, breakable)
            end
        end
        return breakables
    end
}
