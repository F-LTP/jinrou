module.exports=
    name:"植物大战僵尸"
    #
    opening:"一大波僵尸正在接近!"
    # to let players know woh they are
    skin_tip:"你的身份"
    # 主题的作者
    author:"一只小逗比 每天睡不醒"
    # 修改时间
    lastModified:"2021-08-21T10:46:33.917Z"
    vote:"aaaa"
    sunrise:"bbbbbb"
    sunset:"cccccc"
    icon:""
    background_color:"black"
    color:"rgb(255,0,166)"
    lockable:true
    isAvailable:->
        # 如果想要做成有某种限制条件
        # return false
        return true
    skins:
        # 罗马字名 ，只允许半角英数字和下划线，数字和下划线不允许是首位
        # 不可以重复
        Peashooter:
            # 头像链接 和 称号 可以是字符串数组，也可以是字符串
            # 头像在显示的时候 会压缩为48*48，所以最好纵横比是1:1
            avatar:"https://tupian.li/images/2026/02/26/69a0057018b59.gif"
            name:"豌豆射手" 
            prize:"" # 称号是允许留空的
        Sunflower:
            avatar:"https://tupian.li/images/2026/02/26/69a005c2c5065.gif"
            name:"向日葵"
            prize:"" # 称号是允许留空的
        Cherry_Bomb:
            avatar:"https://tupian.li/images/2026/02/26/69a00853e420c.gif"
            name:"樱桃炸弹"
            prize:"" # 称号是允许留空的
        Wallnut:
            avatar:"https://tupian.li/images/2026/02/26/69a007d560d90.gif"
            name:"坚果墙"
            prize:"" # 称号是允许留空的
        Patato_Mine:
            avatar:"https://tupian.li/images/2026/02/26/69a008151b04c.gif"
            name:"土豆地雷"
            prize:"" # 称号是允许留空的
        Snow_Pea:
            avatar:"https://tupian.li/images/2026/02/26/69a003b0bef6b.gif"
            name:"寒冰射手"
            prize:"" # 称号是允许留空的
        Chomper:
            avatar:"https://tupian.li/images/2026/02/26/69a003602de57.gif"
            name:"大嘴花"
            prize:"" # 称号是允许留空的
        Repeater:
            avatar:"https://tupian.li/images/2026/02/26/69a00576ebf6a.gif"
            name:"双发射手"
            prize:"" # 称号是允许留空的
        Puff_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a005e720098.gif","https://tupian.li/images/2026/02/26/69a010e6d51fb.gif"]
            name:"小喷菇"
            prize:"" # 称号是允许留空的
        Sun_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a005e673ce3.gif","https://tupian.li/images/2026/02/26/69a016427aaae.gif"]
            name:"阳光菇"
            prize:"" # 称号是允许留空的
        Fume_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a002afdbf98.gif","https://i.postimg.cc/FK6sdVF6/8dfdd26c5810099c3204b92a1d1a1ff5.gif"]
            name:"大喷菇"
            prize:"" # 称号是允许留空的
        Grave_Buster:
            avatar:"https://tupian.li/images/2026/02/26/69a008192bdb3.gif"
            name:"墓碑吞噬者"
            prize:"" # 称号是允许留空的
        Hypno_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a0084388e8a.gif","https://tupian.li/images/2026/02/26/69a0113734a96.gif"]
            name:"魅惑菇"
            prize:"" # 称号是允许留空的
        Scaredy_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a0034e80bd9.gif","https://tupian.li/images/2026/02/13/698df9cb1f48f.gif"]
            name:"胆小菇"
            prize:"" # 称号是允许留空的
        Ice_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a00390a0127.gif","https://tupian.li/images/2026/02/26/69a010cea2f4e.gif"]
            name:"寒冰菇"
            prize:"" # 称号是允许留空的
        Doom_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a003b74a602.gif","https://tupian.li/images/2026/02/26/69a013f363031.gif"]
            name:"毁灭菇"
            prize:"" # 称号是允许留空的
        Lily_Pad:
            avatar:"https://tupian.li/images/2026/02/26/69a0030ce8ca2.gif"
            name:"睡莲"
            prize:"" # 称号是允许留空的
        Squash:
            avatar:"https://tupian.li/images/2026/02/26/69a00570199a7.gif"
            name:"窝瓜"
            prize:"" # 称号是允许留空的
        Threepeater:
            avatar:"https://tupian.li/images/2026/02/26/69a00e8f81550.gif"
            name:"三线射手"
            prize:"" # 称号是允许留空的
        Tangle_Kelp:
            avatar:"https://tupian.li/images/2026/02/26/69a002ddb9828.gif"
            name:"缠绕海草"
            prize:"" # 称号是允许留空的
        Jalapeno:
            avatar:"https://tupian.li/images/2026/02/26/69a007215e3a4.gif"
            name:"火爆辣椒"
            prize:"" # 称号是允许留空的
        Spikeweed:
            avatar:"https://tupian.li/images/2026/02/26/69a003602d586.gif"
            name:"地刺"
            prize:"" # 称号是允许留空的
        Torchwood:
            avatar:"https://tupian.li/images/2026/02/26/69a007215b2f0.gif"
            name:"火炬树桩"
            prize:"" # 称号是允许留空的
        Tall_nut:
            avatar:"https://tupian.li/images/2026/02/26/69a00387517e0.gif"
            name:"高坚果"
            prize:"" # 称号是允许留空的
        Sea_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a002f374add.gif","https://tupian.li/images/2026/02/26/69a016da8c309.gif"]
            name:"海蘑菇"
            prize:"" # 称号是允许留空的
        Plantern:
            avatar:"https://tupian.li/images/2026/02/26/69a007988f4cc.gif"
            name:"路灯花"
            prize:"" # 称号是允许留空的
        Cactus:
            avatar:"https://tupian.li/images/2026/02/26/69a005bf0a7a8.gif"
            name:"仙人掌"
            prize:"" # 称号是允许留空的
        Blover:
            avatar:"https://tupian.li/images/2026/02/26/69a00853e2ec8.gif"
            name:"三叶草"
            prize:"" # 称号是允许留空的
        Split_Pea:
            avatar:"https://tupian.li/images/2026/02/26/69a007d55de11.gif"
            name:"裂荚射手"
            prize:"" # 称号是允许留空的
        Starfruit:
            avatar:"https://tupian.li/images/2026/02/26/69a005e7d38f3.gif"
            name:"杨桃"
            prize:"" # 称号是允许留空的
        Pumpkin:
            avatar:"https://tupian.li/images/2026/02/26/69a0081777443.gif"
            name:"南瓜头"
            prize:"" # 称号是允许留空的
        Magnet_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a006b4dcaf8.gif","https://tupian.li/images/2026/02/26/69a010c084bc4.gif"]
            name:"磁力菇"
            prize:"" # 称号是允许留空的
        Cabbage_pult:
            avatar:"https://tupian.li/images/2026/02/26/69a0096484933.gif"
            name:"卷心菜投手"
            prize:"" # 称号是允许留空的
        Flower_Pot:
            avatar:"https://tupian.li/images/2026/02/26/69a003b37b178.gif"
            name:"花盆"
            prize:"" # 称号是允许留空的
        Kernel_Put:
            avatar:"https://tupian.li/images/2026/02/26/69a002d823a69.gif"
            name:"玉米投手"
            prize:"" # 称号是允许留空的
        Coffee_Bean:
            avatar:"https://tupian.li/images/2026/02/26/69a0097e1c930.gif"
            name:"咖啡豆"
            prize:"" # 称号是允许留空的
        Garlic:
            avatar:"https://tupian.li/images/2026/02/26/69a0031f69493.gif"
            name:"大蒜"
            prize:"" # 称号是允许留空的
        Umbrella_Leaf:
            avatar:"https://tupian.li/images/2026/02/26/69a009a78ac19.gif"
            name:"叶子保护伞"
            prize:"" # 称号是允许留空的
        Marigold:
            avatar:"https://tupian.li/images/2026/02/26/69a007215d0d2.gif"
            name:"金盏花"
            prize:"" # 称号是允许留空的
        Melon_Pult:
            avatar:"https://tupian.li/images/2026/02/26/69a005bf0829d.gif"
            name:"西瓜投手"
            prize:"" # 称号是允许留空的
        Gatling_Pea:
            avatar:"https://tupian.li/images/2026/02/26/69a007989111e.gif"
            name:"机枪射手"
            prize:"" # 称号是允许留空的
        Twin_Sunflower:
            avatar:"https://tupian.li/images/2026/02/26/69a00a5b322ab.gif"
            name:"双子向日葵"
            prize:"" # 称号是允许留空的
        Gloom_Shroom:
            avatar:["https://tupian.li/images/2026/02/26/69a00abf124e5.gif","https://tupian.li/images/2026/02/26/69a0113736e63.gif"]
            name:"忧郁菇"
            prize:"" # 称号是允许留空的
        Cattail:
            avatar:"https://tupian.li/images/2026/02/26/69a0030d18966.gif"
            name:"猫尾草"
            prize:"" # 称号是允许留空的
        Winter_Melon:
            avatar:"https://tupian.li/images/2026/02/26/69a006b4dc86f.gif"
            name:"冰西瓜"
            prize:"" # 称号是允许留空的
        Gold_Magnet:
            avatar:"https://tupian.li/images/2026/02/26/69a00f54096fe.gif"
            name:"吸金磁"
            prize:"" # 称号是允许留空的
        Spikerock:
            avatar:"https://tupian.li/images/2026/02/26/69a003827f3a0.gif"
            name:"钢地刺"
            prize:"" # 称号是允许留空的
        Cob_Cannon:
            avatar:"https://tupian.li/images/2026/02/26/69a002d340957.gif"
            name:"玉米加农炮"
            prize:"" # 称号是允许留空的
        Imitater:
            avatar:"https://tupian.li/images/2026/02/26/69a009ba35102.gif"
            name:"模仿者"
            prize:"" # 称号是允许留空的
        Putong:
            avatar:"https://tupian.li/images/2026/02/26/69a00f802cebb.gif"
            name:"普通僵尸"
            prize:"" # 称号是允许留空的
        Ban:
            avatar:"https://tupian.li/images/2026/02/26/69a02300e9315.gif"
            name:"伴舞僵尸"
            prize:"" # 称号是允许留空的
        Che:
            avatar:"https://tupian.li/images/2026/02/26/69a0216a1374b.gif"
            name:"冰车僵尸"
            prize:"" # 称号是允许留空的
        Cheng:
            avatar:"https://tupian.li/images/2026/02/26/69a0216a11bac.gif"
            name:"撑杆跳僵尸"
            prize:"" # 称号是允许留空的
        Beng:
            avatar:"https://tupian.li/images/2026/02/26/69a02300e9c85.gif"
            name:"蹦极僵尸"
            prize:"" # 称号是允许留空的
        Ti:
            avatar:"https://tupian.li/images/2026/02/26/69a02191a40d0.gif"
            name:"扶梯僵尸"
            prize:"" # 称号是允许留空的
        Dui:
            avatar:"https://tupian.li/images/2026/02/26/69a0234987f96.gif"
            name:"雪橇车小队"
            prize:"" # 称号是允许留空的
        Xue:
            avatar:"https://tupian.li/images/2026/02/26/69a0234988e10.gif"
            name:"雪人僵尸"
            prize:"" # 称号是允许留空的
        Gan:
            avatar:"https://tupian.li/images/2026/02/26/69a021a3e0afc.gif"
            name:"橄榄球僵尸"
            prize:"" # 称号是允许留空的
        Bao:
            avatar:"https://tupian.li/images/2026/02/26/69a024c6134fa.gif"
            name:"读报僵尸"
            prize:"" # 称号是允许留空的
        Tun:
            avatar:"https://tupian.li/images/2026/02/26/69a02406e7296.gif"
            name:"海豚僵尸"
            prize:"" # 称号是允许留空的
        Ju:
            avatar:"https://tupian.li/images/2026/02/26/69a021ab66ffa.gif"
            name:"伽刚特尔"
            prize:"" # 称号是允许留空的
        Ya:
            avatar:"https://tupian.li/images/2026/02/26/69a021c0afa40.gif"
            name:"救生圈僵尸"
            prize:"" # 称号是允许留空的
        Kuang:
            avatar:"https://tupian.li/images/2026/02/26/69a021d476600.gif"
            name:"矿工僵尸"
            prize:"" # 称号是允许留空的
        Zhang:
            avatar:"https://tupian.li/images/2026/02/26/69a021e851ac8.gif"
            name:"路障僵尸"
            prize:"" # 称号是允许留空的
        Qi:
            avatar:"https://tupian.li/images/2026/02/26/69a021e851ac8.gif"
            name:"旗帜僵尸"
            prize:"" # 称号是允许留空的
        Fei:
            avatar:"https://tupian.li/images/2026/02/26/69a022258a973.gif"
            name:"气球僵尸"
            prize:"" # 称号是允许留空的
        Qian:
            avatar:"https://tupian.li/images/2026/02/26/69a023a5a1a61.gif"
            name:"潜水僵尸"
            prize:"" # 称号是允许留空的
        Tiao_Tiao:
            avatar:"https://tupian.li/images/2026/02/26/69a0260fba375.gif"
            name:"跳跳僵尸"
            prize:"" # 称号是允许留空的
        Tong:
            avatar:"https://tupian.li/images/2026/02/26/69a023d98e031.gif"
            name:"铁桶僵尸"
            prize:"" # 称号是允许留空的
        Men:
            avatar:"https://tupian.li/images/2026/02/26/69a0250163b99.gif"
            name:"铁网门僵尸"
            prize:"" # 称号是允许留空的
        Tou_Shi:
            avatar:"https://tupian.li/images/2026/02/26/69a0250c03601.gif"
            name:"投石车僵尸"
            prize:"" # 称号是允许留空的
        Wu:
            avatar:"https://tupian.li/images/2026/02/26/69a022b16c932.gif"
            name:"舞王僵尸"
            prize:"" # 称号是允许留空的
        Chou:
            avatar:"https://tupian.li/images/2026/02/26/69a022b16d58d.gif"
            name:"小丑僵尸"
            prize:"" # 称号是允许留空的
        Xiao:
            avatar:"https://tupian.li/images/2026/02/26/69a02300e98ca.gif"
            name:"小鬼僵尸"
            prize:"" # 称号是允许留空的
        Bo:
            avatar:"https://tupian.li/images/2026/02/26/69a0234be416f.gif"
            name:"僵王博士"
            prize:"" # 称号是允许留空的
