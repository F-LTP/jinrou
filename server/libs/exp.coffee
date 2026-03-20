# 经验值/等级系统模块
config = require '../../config/app.coffee'

module.exports =
    # 根据经验值获取等级
    getLevel: (exp) ->
        levelExp = config.exp.levelExp
        level = 1
        for l, e of levelExp
            level = parseInt(l) if exp >= e
        return level

    # 获取当前等级的经验值进度
    getExpProgress: (exp) ->
        level = @getLevel(exp)
        levelExp = config.exp.levelExp
        currentLevelExp = levelExp[level] || 0

        # 找到下一等级的经验值
        nextLevelExp = null
        for l, e of levelExp
            if parseInt(l) > level
                nextLevelExp = e
                break

        # 如果已经是最高等级
        if nextLevelExp == null
            return {
                level: level
                currentExp: exp - currentLevelExp
                currentLevelExp: currentLevelExp
                nextLevelExp: null
                progress: 1
            }

        return {
            level: level
            currentExp: exp - currentLevelExp
            currentLevelExp: currentLevelExp
            nextLevelExp: nextLevelExp
            progress: (exp - currentLevelExp) / (nextLevelExp - currentLevelExp)
        }

    # 计算单局游戏经验值
    calculateGameExp: (player, game) ->
        rules = config.exp.rules
        roleBonus = config.exp.roleBonus

        # GM 和 Helper 使用专门的规则
        if player.originalType == "GameMaster"
            return rules.gm || 0
        if player.originalType == "Helper"
            return rules.helper || 0

        exp = rules.gameParticipation || 0

        # 根据胜负情况
        if player.winner == true
            exp += rules.win || 0
        else if player.winner == false
            exp += rules.lose || 0
        else if game.winner == "Draw"
            exp += rules.draw || 0

        # 役职加成
        job = player.originalType
        if roleBonus[job]?
            exp += roleBonus[job]

        # 存活奖励（非突然死）
        if player.originalType not in ["GameMaster", "Helper", "Watching"]
            isGone = game.gamelogs?.some((log) ->
                log.event == "found" and log.flag in ["gone-day", "gone-night"] and log.id == player.id
            )
            if !isGone
                exp += rules.surviveBonus || 0
            else
                exp += rules.gonePenalty || 0

        return exp

    # 为用户添加经验值
    addUserExp: (userid, expToAdd, callback) ->
        return callback(new Error("Invalid exp amount")) if isNaN(expToAdd)
        M.users.findOne {userid: userid}, (err, doc) =>
            return callback(err) if err
            return callback(new Error("User not found")) if !doc?

            currentExp = doc.exp || 0
            newExp = currentExp + expToAdd
            newExp = 0 if newExp < 0  # 经验值不能为负

            newLevel = @getLevel(newExp)

            M.users.update {userid: userid}, {$set: {exp: newExp}}, (err) =>
                return callback(err) if err

                # 返回升级信息
                oldLevel = @getLevel(currentExp)
                callback null, {
                    oldExp: currentExp
                    newExp: newExp
                    oldLevel: oldLevel
                    newLevel: newLevel
                    levelUp: newLevel > oldLevel
                }

    # 获取用户等级信息
    getUserLevelInfo: (userid, callback) ->
        M.users.findOne {userid: userid}, (err, doc) =>
            return callback(err) if err
            return callback(new Error("User not found")) if !doc?

            exp = doc.exp || 0
            progress = @getExpProgress(exp)

            callback null, {
                userid: doc.userid
                name: doc.name
                exp: exp
                level: progress.level
                currentLevelExp: progress.currentLevelExp
                nextLevelExp: progress.nextLevelExp
                progress: progress.progress
            }
