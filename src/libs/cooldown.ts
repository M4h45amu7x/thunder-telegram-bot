const cooldowns = new Map<string, number>()

export const cooldown = {
    checkCooldown: (key: string, duration = 3000) => {
        const currentTime = Date.now()
        const lastUsed = cooldowns.get(key)

        if (lastUsed && currentTime < lastUsed + duration) return false

        cooldowns.set(key, currentTime)
        return true
    },
}
