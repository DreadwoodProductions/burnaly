local Services = loadstring(game:HttpGet("https://burnaly.com/roblox/services.lua"))()

return {
    waitForGameLoad = function()
        repeat task.wait() until game:IsLoaded()
        local LocalPlayer = Services.Players.LocalPlayer
        repeat task.wait() until LocalPlayer
        repeat task.wait() until LocalPlayer.Character
    end,
    
    setupAntiIdle = function()
        local LocalPlayer = Services.Players.LocalPlayer
        if getconnections then
            for _, connection in ipairs(getconnections(LocalPlayer.Idled)) do
                connection:Disable()
            end
        end

        LocalPlayer.Idled:Connect(function()
            local VirtualUser = Services.VirtualUser
            local Camera = Services.Workspace.CurrentCamera
            local mousePos = Vector2.new(0, 0)
            VirtualUser:Button2Down(mousePos, Camera.CFrame)
            task.wait(1)
            VirtualUser:Button2Up(mousePos, Camera.CFrame)
        end)
    end,
    
    loadModule = function(url)
        local success, result = pcall(function()
            return loadstring(game:HttpGet(url))()
        end)
        if not success then
            error(string.format("Failed to load module from %s: %s", url, result))
        end
        return result
    end,
    
    formatNumber = function(number)
        if number >= 1e12 then
            return string.format("%.1ft", number / 1e12)
        elseif number >= 1e9 then
            return string.format("%.1fb", number / 1e9)
        elseif number >= 1e6 then
            return string.format("%.1fm", number / 1e6)
        elseif number >= 1e3 then
            return string.format("%.1fk", number / 1e3)
        end
        return tostring(number)
    end,
    
    getDistance = function(pos1, pos2)
        return (pos1 - pos2).Magnitude
    end
}
