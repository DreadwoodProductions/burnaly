local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()

local MyRemotes = {
    Mining = {
        ['mineOre'] = Services.ReplicatedStorage.Network:WaitForChild("Mining_Attack"):InvokeServer(unpack(args)),
        ['spawnMagmaOre'] = Services.ReplicatedStorage.Network:WaitForChild("Consumables_Consume"):InvokeServer("9841d670942d4b6a807269acca7840f6", 1)
    }
}

return MyRemotes
