// アプリ画面の変数
const DISPLAY_WIDTH = 2000
const DISPLAY_HEIGHT = 1000

// ボタンエリアの変数
const BUTTON_WIDTH = 325
const BUTTON_HEIGHT = 175
const OPTION_BUTTON_WIDTH = 50
const OPTION_BUTTON_HEIGHT = 80
const BUTTON_AREA_WIDTH = 400

// グラフエリアの変数
const CANVAS_WIDTH = 1600
const GRAPH_WIDTH = 1500
const GRAPH_HEIGHT = 850
const GRAPH_MARGIN_TOP = 50
const TIMELINE_HEIGHT = 100
const VERTICAL_AXIS_WIDTH = 100
const VERTICAL_INTERVAL = 85
const HORIZONTAL_INTERVAL = 20
const BAR_WIDTH = 50

/** 年の配列 */
let years = []

/**
 * 各観光地の年ごとの観光客数
 * @type {Array<{name: string, statistics: {year: number, numVisitors: number}[]}>}
 */
const spots = [];

/** マウスダウンしているかのboolean */
let isMouseDown = false

/** canvasの左端からマウスポインターの距離(x方向) */
let mousePosX = -1

/** マウスポインタのx座標 */
let currentX = 0

/** xのスケール */
let scaleX = 1.0

/** 並べ替えが行われているかのboolean */
let isSorting = false

let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

const buttons = [
    {
        id: 0,
        label: "東山温泉",
        color: "green",
        isSelected: false
    },
    {
        id: 1,
        label: "芦ノ牧温泉",
        color: "pink",
        isSelected: false
    },
    {
        id: 2,
        label: "鶴ヶ城",
        color: "yellow",
        isSelected: false
    },
    {
        id: 3,
        label: "御薬園",
        color: "blue",
        isSelected: false
    },
    {
        id: 4,
        label: "県立博物館",
        color: "red",
        isSelected: false
    }
]

function drawWhiteDisplay() {
    const display = document.getElementById("display")
    display.style.height = DISPLAY_HEIGHT
    display.style.width = DISPLAY_WIDTH
    display.style.border = "solid 1px black"
    display.style.display = "flex"
}

function drawButtonsArea() {
    const buttonsArea = document.getElementById("buttons-area")
    buttonsArea.style.height = DISPLAY_HEIGHT
    buttonsArea.style.width = BUTTON_AREA_WIDTH
    buttonsArea.style.border = "solid 1px black"

    buttons.map(button => {
        const allDiv = document.createElement('div')
        allDiv.style.display = 'flex'
        allDiv.style.justifyContent = 'center'
        allDiv.style.alignItems = 'center'
        allDiv.style.width = BUTTON_WIDTH + OPTION_BUTTON_WIDTH
        allDiv.style.height = BUTTON_HEIGHT
        allDiv.style.margin = '10 0'

        const buttonElement = document.createElement(`button`)
        buttonElement.className = "graph-selection-button"
        buttonElement.append(button.label)
        buttonElement.style.width = BUTTON_WIDTH
        buttonElement.style.height = BUTTON_HEIGHT
        buttonElement.style.backgroundColor = button.color
        buttonElement.addEventListener("click", () => {
            isSorting = false
            button.isSelected = !button.isSelected
            drawGraph()
        })
        allDiv.appendChild(buttonElement)

        const optionalButtonsDiv = document.createElement('div')
        optionalButtonsDiv.style.width = OPTION_BUTTON_WIDTH
        optionalButtonsDiv.style.height = BUTTON_HEIGHT
        optionalButtonsDiv.style.display = 'flex'
        optionalButtonsDiv.style.flexDirection = 'column'
        optionalButtonsDiv.style.justifyContent = 'space-between'

        const ascendingButton = document.createElement('buttton')
        ascendingButton.title = "昇順に並べ替え"
        ascendingButton.style.width = OPTION_BUTTON_WIDTH
        ascendingButton.style.height = OPTION_BUTTON_HEIGHT
        ascendingButton.style.backgroundColor = 'gray'
        ascendingButton.style.fontSize = '3rem'
        ascendingButton.append('↗')
        ascendingButton.addEventListener('click', () => {
            isSorting = true
            button.isSelected = false
            buttons.filter((_button) => _button.id !== button.id && _button.isSelected).forEach(_button => _button.isSelected = false)
            drawSortingGraph(button.label, button.color, "ascending")
        })
        optionalButtonsDiv.appendChild(ascendingButton)

        const descendingButton = document.createElement('buttton')
        descendingButton.title = "降順に並べ替え"
        descendingButton.style.width = OPTION_BUTTON_WIDTH
        descendingButton.style.height = OPTION_BUTTON_HEIGHT
        descendingButton.style.backgroundColor = 'gray'
        descendingButton.style.fontSize = '3rem'
        descendingButton.append('↘')
        descendingButton.addEventListener('click', () => {
            isSorting = true
            button.isSelected = false
            buttons.filter((_button) => _button.id !== button.id && _button.isSelected).forEach(_button => _button.isSelected = false)
            drawSortingGraph(button.label, button.color, "descending")
        })
        optionalButtonsDiv.appendChild(descendingButton)

        allDiv.appendChild(optionalButtonsDiv)

        const buttonsArea = document.getElementById("buttons-area")
        buttonsArea.appendChild(allDiv)
    })
}

let spotName = ""
let color = ""
let direction = ""

function drawSortingGraph(_spotName, _color, _direction) {
    canvas.width = CANVAS_WIDTH
    canvas.height = DISPLAY_HEIGHT
    ctx.clearRect(0, 0, CANVAS_WIDTH, DISPLAY_HEIGHT)
    ctx.lineWidth = 1
    ctx.strokeRect(VERTICAL_AXIS_WIDTH, GRAPH_MARGIN_TOP, GRAPH_WIDTH, GRAPH_HEIGHT)

    for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(VERTICAL_AXIS_WIDTH, GRAPH_MARGIN_TOP + VERTICAL_INTERVAL*i)
        ctx.lineTo(VERTICAL_AXIS_WIDTH + GRAPH_WIDTH, GRAPH_MARGIN_TOP + VERTICAL_INTERVAL*i)
        ctx.lineWidth = 0.25
        ctx.stroke()
    }

    if (spotName !== _spotName) {
        spotName = _spotName
    }
    if (color !== _color) {
        color = _color
    }
    if (direction !== _direction) {
        direction = _direction
    }

    const _spot = spots.find(spot => spot.name === spotName)
    if (!_spot) return
    const spot = _spot.statistics.toSorted((a, b) => {
        if (direction === "ascending") {
            return a.numVisitors - b.numVisitors
        } else if (direction === "descending") {
            return b.numVisitors - a.numVisitors
        }
    })

    ctx.font = "24px serif" 
    for (let year_i = 0; year_i < years.length; year_i++) {
        ctx.fillText(spot[year_i].year, VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX, GRAPH_MARGIN_TOP + GRAPH_HEIGHT + TIMELINE_HEIGHT/2)
    }

    ctx.fillStyle = color
    for (let year_i = 0; year_i < years.length; year_i++) {
        ctx.fillRect(
            VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX,
            GRAPH_MARGIN_TOP + GRAPH_HEIGHT,
            BAR_WIDTH*scaleX,
            -Number(spot[year_i].numVisitors)*(GRAPH_HEIGHT/1000000)
        )
    }

    // 縦軸のラベルを描画
    ctx.fillStyle = "black"
    ctx.clearRect(0, 0, VERTICAL_AXIS_WIDTH, GRAPH_MARGIN_TOP + GRAPH_HEIGHT + TIMELINE_HEIGHT)
    for (let i = 0; i <= 10; i += 1) {
        ctx.fillText(1000000 - 100000*i, 0, GRAPH_MARGIN_TOP + VERTICAL_INTERVAL*i)
    }
}

function drawGraph() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, DISPLAY_HEIGHT)
    canvas.width = CANVAS_WIDTH
    canvas.height = DISPLAY_HEIGHT
    ctx.lineWidth = 1
    ctx.strokeRect(VERTICAL_AXIS_WIDTH, GRAPH_MARGIN_TOP, GRAPH_WIDTH, GRAPH_HEIGHT)

    for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(VERTICAL_AXIS_WIDTH, GRAPH_MARGIN_TOP + VERTICAL_INTERVAL*i)
        ctx.lineTo(VERTICAL_AXIS_WIDTH + GRAPH_WIDTH, GRAPH_MARGIN_TOP + VERTICAL_INTERVAL*i)
        ctx.lineWidth = 0.25
        ctx.stroke()
    }

    // 年のラベルを描画
    ctx.font = "24px serif" 
    for (let year_i = 0; year_i < years.length; year_i++) {
        ctx.fillText(years[year_i], VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX, GRAPH_MARGIN_TOP + GRAPH_HEIGHT + TIMELINE_HEIGHT/2)
    }

    // 各観光地の年ごとのデータを取得し、昇順でソートしてグラフに描画する
    for (let year_i = 0; year_i < years.length; year_i++) {
        const spotsVisitors = []
        for (let spot_i = 0; spot_i < 5; spot_i++) {
            const spot = spots[spot_i]
            if (!buttons[spot_i].isSelected) {
                continue
            }

            spotsVisitors.push({
                color: buttons[spot_i].color,
                numVisitors: spot.statistics[year_i].numVisitors
            })
        }
        
        spotsVisitors.sort((a, b) => b.numVisitors - a.numVisitors)
        for (const spotVisitors of spotsVisitors) {
            ctx.fillStyle = spotVisitors.color
            ctx.fillRect(
                VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX,
                GRAPH_MARGIN_TOP + GRAPH_HEIGHT,
                BAR_WIDTH*scaleX,
                -Number(spotVisitors.numVisitors)*(GRAPH_HEIGHT/1000000)
            )
        }
    }

    // 縦軸のラベルを描画
    ctx.fillStyle = "black"
    ctx.clearRect(0, 0, VERTICAL_AXIS_WIDTH, GRAPH_MARGIN_TOP + GRAPH_HEIGHT + TIMELINE_HEIGHT)
    for (let i = 0; i <= 10; i += 1) {
        ctx.fillText(1000000 - 100000*i, 0, GRAPH_MARGIN_TOP + VERTICAL_INTERVAL*i)
    }
}

async function readCSV(filePath) {
    try {
        const response = await fetch(filePath)
        if (!response.ok) {
            throw new Error("CSV file not found!!!")
        }

        // テキストデータにしてカンマ区切りでデータ取得
        const textData = await response.text()
        const rows = textData.trim().split("\n").map(row => row.split(","))

        // 年だけを抽出
        years = rows.slice(1).map(row => {
            return row[0]
        })

        for (let i = 2; i <= 6; i++) {
            let spot = {
                name: "",
                statistics: []
            }
            // 観光地のラベルを抽出して割り当て
            spot.name = buttons[i-2].label
            rows.slice(1).map(row => {
                const year = row[0]
                const numVisitors = Number(row[i])
                spot.statistics.push({year, numVisitors})
            })
            spots.push(spot)
        }
    } catch(e) {
        console.error(e)
    }
}

async function init() {
    drawWhiteDisplay()
    drawButtonsArea()

    if (spots.length === 0) await readCSV("./otouristfacilitytransition.csv")

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true
        mousePosX = e.offsetX
    })
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false
    })
    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const pastMousePosX = mousePosX
            mousePosX = e.offsetX
            currentX += (mousePosX - pastMousePosX) * scaleX
            
            //最初の年のバー(1992年)がグラフの右端に触れたら、画面外に出さないためにそれ以上はグラフを右に動かないようにする
            if (currentX > (GRAPH_WIDTH - BAR_WIDTH*scaleX)) {
                console.log("Bar touched right edge.")
                currentX = GRAPH_WIDTH - BAR_WIDTH*scaleX
            //最後の年のバー(2023年)がグラフの左端に触れたら、画面外に出さないためにそれ以上はグラフを左に動かないようにする
            } else if (currentX < -(HORIZONTAL_INTERVAL + BAR_WIDTH)*(years.length - 1)*scaleX) {
                console.log("Bar touched left edge.")
                currentX = -(HORIZONTAL_INTERVAL + BAR_WIDTH)*(years.length - 1)*scaleX
            }
            isSorting ? drawSortingGraph(spotName, color, direction) : drawGraph()
        }
    })
    canvas.addEventListener('mousemove', (e) => {
        if (e.offsetX < VERTICAL_AXIS_WIDTH || VERTICAL_AXIS_WIDTH + GRAPH_WIDTH < e.offsetX) {
            return
        }
        if (e.offsetY < GRAPH_MARGIN_TOP || GRAPH_MARGIN_TOP + GRAPH_HEIGHT < e.offsetY) {
            return
        }

        // 各観光地の年ごとのデータを取得し、昇順でソートしてグラフに描画する
        for (let year_i = 0; year_i < years.length; year_i++) {
            const spotsVisitors = []
            for (let spot_i = 0; spot_i < 5; spot_i++) {
                const spot = spots[spot_i]
                if (!buttons[spot_i].isSelected) {
                    continue
                }

                spotsVisitors.push({
                    color: buttons[spot_i].color,
                    numVisitors: spot.statistics[year_i].numVisitors
                })
            }
            
            spotsVisitors.sort((a, b) => b.numVisitors - a.numVisitors)
            const spotVisitors = spotsVisitors[0]
            if (spotVisitors === undefined) {
                continue
            }
            if (
                VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX < e.offsetX &&
                e.offsetX < VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX + BAR_WIDTH*scaleX
            ) {
                if (
                    GRAPH_MARGIN_TOP + GRAPH_HEIGHT - Number(spotVisitors.numVisitors)*(GRAPH_HEIGHT/1000000) < e.offsetY &&
                    e.offsetY < GRAPH_MARGIN_TOP + GRAPH_HEIGHT
                ) {
                    ctx.fillStyle = "black"
                    ctx.roundRect(
                        VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX + BAR_WIDTH*scaleX,
                        GRAPH_MARGIN_TOP + GRAPH_HEIGHT - Number(spotVisitors.numVisitors)*(GRAPH_HEIGHT/1000000),
                        200,
                        100,
                        10
                    )
                    ctx.stroke()
                    ctx.fillStyle = "white"
                    ctx.fill()
                    ctx.fillStyle = "black"
                    ctx.fillText("hola", VERTICAL_AXIS_WIDTH + (HORIZONTAL_INTERVAL + BAR_WIDTH)*year_i*scaleX + currentX + BAR_WIDTH*scaleX + 10, GRAPH_MARGIN_TOP + GRAPH_HEIGHT - Number(spotVisitors.numVisitors)*(GRAPH_HEIGHT/1000000) + 20)
                }
            }
        }
    })

    let prevScaleX = scaleX
    canvas.addEventListener('wheel', (e) => {
        let nextScaleX = scaleX
        if (e.deltaY > 0) {
            nextScaleX *= 1.1
        } else {
            nextScaleX *= 0.9
        }
        scaleX = Math.min(Math.max(nextScaleX, 0.5), 5)

        if (0.5 < scaleX && scaleX < 5) {
            currentX += (e.offsetX)*(prevScaleX - scaleX)
            drawGraph()
        }
        prevScaleX = scaleX
    })

    drawGraph()
}