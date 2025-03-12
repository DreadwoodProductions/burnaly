local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()

local Attributes = {
    PetsGo = {
        ['MagmaOreActive'] = Services.Workspace.MAP.INTERACT.MiningPads["Magma Ore"]:GetAttribute('OreActive')
    }
}

return Attributes
