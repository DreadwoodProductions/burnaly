local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()
local Save = require(Services.ReplicatedStorage.Library.Client.Save)
local Network = Services.ReplicatedStorage:WaitForChild("Network")

return {
    ORES = {
        "Dirt", "Stone", "Bronze", "Iron", "Gold",
        "Emerald", "Obsidian", "Runic", "Magma"
    },
    
    OreIDs = {
        Dirt = 6,
        Stone = 5,
        Bronze = 3,
        Iron = 2,
        Gold = 1,
        Emerald = 4,
        Obsidian = {9, 10},
        Runic = {7, 8},
        Magma = 11
    },
    
    PickaxeRequirements = {
        [6] = "Wooden Pickaxe",   -- Dirt
        [5] = "Stone Pickaxe",    -- Stone
        [3] = "Stone Pickaxe",    -- Bronze
        [2] = "Stone Pickaxe",    -- Iron
        [1] = "Bronze Pickaxe",   -- Gold
        [4] = "Iron Pickaxe",     -- Emerald
        [9] = "Gold Pickaxe",     -- Obsidian
        [10] = "Gold Pickaxe",    -- Obsidian
        [7] = "Gold Pickaxe",     -- Runic
        [8] = "Gold Pickaxe",     -- Runic
        [11] = "Gold Pickaxe"     -- Magma
    },
    
    getMagmaScrollValue = function()
        local currentData = Save.Get()
        for key, value in pairs(currentData) do
            if type(value) == "table" and key == 'Effects' then
                if value["Magma Scroll"] then
                    for _, v in pairs(value["Magma Scroll"]) do
                        return v
                    end
                end
            end
        end
        return nil
    end,
    
    getSelectedPickaxe = function()
        local currentData = Save.Get()
        for key, value in pairs(currentData) do
            if type(value) == "table" and key == 'SelectedPickaxe' then
                if value.data and value.data.id then
                    return value.data.id
                end
            end
        end
        return nil
    end,
    
    canMineOre = function(self, oreId)
        local currentPickaxe = self.getSelectedPickaxe()
        local requiredPickaxe = self.PickaxeRequirements[oreId]
        
        if not currentPickaxe or not requiredPickaxe then return false end
        
        local pickaxeStrength = {
            ["Wooden Pickaxe"] = 1,
            ["Stone Pickaxe"] = 2,
            ["Bronze Pickaxe"] = 3,
            ["Iron Pickaxe"] = 4,
            ["Gold Pickaxe"] = 5,
            ["Emerald Pickaxe"] = 6
        }
        
        return pickaxeStrength[currentPickaxe] >= pickaxeStrength[requiredPickaxe]
    end,
    
    spawnMagmaOre = function()
        local args = {
            [1] = "9841d670942d4b6a807269acca7840f6",
            [2] = 1
        }
        Network:WaitForChild("Consumables_Consume"):InvokeServer(unpack(args))
    end,
    
    mineOre = function(self, oreId)
        if self:canMineOre(oreId) then
            local args = {[1] = oreId}
            Network:WaitForChild("Mining_Attack"):InvokeServer(unpack(args))
        end
    end,
    
    handleMagmaOre = function(self)
        local magmaScrollValue = self.getMagmaScrollValue()
        
        if magmaScrollValue then
            self:mineOre(self.OreIDs.Magma)
            return true
        end
        
        if not magmaScrollValue then
            self.spawnMagmaOre()
            self:mineOre(self.OreIDs.Magma)
            return true
        end
        
        return false
    end
}
