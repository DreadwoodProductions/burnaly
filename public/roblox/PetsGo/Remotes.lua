local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()

local Remotes = {
    Mining = {
        ['mineOre'] = function(args)
            return Services.ReplicatedStorage.Network:WaitForChild("Mining_Attack"):InvokeServer(unpack(args))
        end,
        ['spawnMagmaOre'] = function()
            return Services.ReplicatedStorage.Network:WaitForChild("Consumables_Consume"):InvokeServer("9841d670942d4b6a807269acca7840f6", 1)
        end
    }
}

return Remotes
