const Agent = require('ai-agents').Agent;
let infinito = Number.MAX_SAFE_INTEGER;
class HexAgent extends Agent {
    constructor(value) {
        super(value);
    }

    /**
     * return a new move. The move is an array of two integers, representing the
     * row and column number of the hex to play. If the given movement is not valid,
     * the Hex controller will perform a random valid movement for the player
     * Example: [1, 1]
     */
    send() {
        var start = new Date().getTime();
        let board = this.perception;
        let size = board.length;
        let available = getHexAt(board, 0);
        let nTurn = size * size - available.length;
        let limite = 3;
        let agente = this.getID();

        let raiz = {
            type: 'MAX',
            level: 0,
            children: [],
            utility: -infinito,
            board: board,
            action: null,
        };

        if (nTurn == 0) {
            // First move
            //console.log('el turno del agente: ',this.getID())
            console.log([Math.floor(size / 2), Math.floor(size / 2) - 1]);
            return [Math.floor(size / 2), Math.floor(size / 2) - 1];
        } else if (nTurn == 1) {
            //console.log('el turno del agente: ',this.getID())
            console.log([Math.floor(size / 2), Math.floor(size / 2)]);
            return [Math.floor(size / 2), Math.floor(size / 2)];
        }
        //console.log(amplitud(root,this.getID(),4));
        //console.log(minimax(nodoMinmax,2,nodoMinmax.type,this.getID()))
        console.log('Pienso, luego existo...');
        //Se crea el arbol con todo en infinito
        let nodoRaizMinMax = generarArbol(raiz, agente, limite);
        //Le pasamos el arbol a minimax para que retorne el mejor valor y cambie los infinitos del arbol
        /*
        //ESTE COMENTARIO ES DEL MINIMAX
        let valorMinimax = minimax(
            nodoRaizMinMax,
            limite,
            nodoRaizMinMax.type,
            agente
        );
        //Le pregunta al arbol con utilidad definida cual de sus nodos es igual al minimax
        let jugada = retornarPosition(nodoRaizMinMax, valorMinimax);

        console.log(
            'El valor del mejor camino con minimax en ' +
                limite +
                ' niveles sin un hash con una heuristica chafa es: ',
            valorMinimax
        );
        //console.log('arbol generado: ',nodoRaizMinMax);        
        //console.log(generarArbol(raiz,this.getID(),limite))
        */

        //////      ESTE COMENTARIO ES DEL ALFA     //////
        let valorAlpha = alfa_Beta(
            nodoRaizMinMax,
            limite,
            -infinito,
            infinito,
            agente
        );
        let jugada = retornarPosition(nodoRaizMinMax, valorAlpha);
        console.log('Arbol generado: ', nodoRaizMinMax);
        console.log(
            'El valor del mejor camino con alfa-beta en ' +
                limite +
                ' niveles sin un hash es: ',
            valorAlpha
        );
        console.log('La jugada para ' + agente + ' es: ', jugada);
        //////      ESTE COMENTARIO ES DEL ALFA     //////
        let move =
            available[Math.round(Math.random() * (available.length - 1))];

        var end = new Date().getTime();
        var time = (end - start) / 1000;
        console.log('time: ', time, 's');

        //return [Math.floor(move / board.length), move % board.length];
        return jugada;
    }
}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex (0)
 * or the player id (1 or 2) in the board
 * @param {Array} board
 * @param {Number} pid
 */
function getHexAt(board, pid) {
    let id = 0;
    switch (pid) {
        case 1:
            id = 1;
            break;
        case 2:
            id = 2;
            break;
        default:
            break;
    }
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] == pid) {
                //result.push(k * size + j);
                result.push([k, j]);
            }
        }
    }
    return result;
}

/**
 * Returns 3 arrays the first contain the relative position of the empty cells around
 * The second array contains the relative position of the cells occupied by player 1
 * And third array contains the relative position of the cells occupied by player 2
 * Relative Positions:
 * Up          : 0
 * Up & Right  : 1
 * Right       : 2
 * Down        : 3
 * Down & Left : 4
 * Left        : 5
 * @param {Array} board
 * @param {Array} pos
 */
function checkAround(board, pos) {
    let around = [[], [], []];
    let up = pos[0] == 0;
    let down = pos[0] == board.length - 1;
    let left = pos[1] == 0;
    let right = pos[1] == board.length - 1;

    for (let i = 0; i < 6; i++) {
        switch (i) {
            case 0: //up
                if (!up) {
                    around[board[pos[0] - 1][pos[1]]].push(i);
                }
                break;
            case 1: //up & right
                if (!up && !right) {
                    around[board[pos[0] - 1][pos[1] + 1]].push(i);
                }
                break;
            case 2: //right
                if (!right) {
                    around[board[pos[0]][pos[1] + 1]].push(i);
                }
                break;
            case 3: //down
                if (!down) {
                    around[board[pos[0] + 1][pos[1]]].push(i);
                }
                break;
            case 4: // down & left
                if (!down && !left) {
                    around[board[pos[0] + 1][pos[1] - 1]].push(i);
                }
                break;
            case 5: //left
                if (!left) {
                    around[board[pos[0]][pos[1] - 1]].push(i);
                }
                break;
        }
    }
    return around;
}
/**
 * Rank the connections for a given player in a board.
 * having a piece that connects with two others rank the highest, then having a triple connection
 * @param {Array} board
 * @param {Number} pid //player id
 */
function countConnects(board, pid) {
    let cells = 0;
    let playerChips = getHexAt(board, 1);
    let rid = rival(pid); //rival id
    let length = board.length;
    let valOf0C = 0;
    let valOf1C = 2;
    let valOf2C = 4;
    let valOf3C = 3;
    let valOf4plusC = 1;

    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            if (board[i][j] == pid) {
                let around = checkAround(board, [i, j]);
                switch (around[pid].length) {
                    case 0:
                        cells += valOf0C;
                        break;
                    case 1:
                        cells += valOf1C;
                        break;
                    case 2:
                        cells += valOf2C;
                        break;
                    case 3:
                        cells += valOf3C;
                        break;

                    default:
                        cells += valOf4plusC;
                        // 0 connections or 3 or more
                        break;
                }
            }
        }
    }
    return cells;
}

/**
 * Retorna cual es el rival
 * @param {Matrix} board
 */
function rival(id_Agent) {
    switch (id_Agent) {
        case '1':
            return '2';
        case '2':
            return '1';
    }
}

//TODO
function hashNodeToId(node) {
    let board = node.board;
    let hashId = '';
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            let num = board[i][j];
            hashId = hashId.concat(num.toString(10));
        }
    }
    return hashId;
}

//TODO
function avoidRepeatedState(node, hash) {
    let hashId = hashNodeToId(node);
    //console.log(hashNum);
    //console.log(isHashRepeated(node, hashNum));
    if (hash.includes(hashId)) {
        return false;
    }
    hash.unshift(hashId);
    //console.log(hash);
    return true;
}

/**
 * Funcion Heuristica donde llamaremos a las demas funciones que en conjunto darán un valor al estado
 * @param {Matrix} board
 * @param {int} id_Agent
 */
function heuristica(board, id_Agent) {
    let result = 0;
    let size = board.length;
    let centro = Math.round(size / 2);
    let puentesVal;
    let connectsVal;

    /* for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] == 2 || board[k][j] == 1){//parseInt(id_Agent, 10)) {
                //console.log('encontre un 1 en: ',k,j)
                if (k < centro) {
                    result = result + k + 1;
                } else result = result + size - k;

                if (j < centro) {
                    result = result + j + 1;
                } else result = result + size - j;
                //console.log('heuristica de: ',k,j,'es: ',result)
            }
        }
    } */

    puentesVal = puentes(board, id_Agent) - puentes(board, rival(id_Agent)) / 2; //,type) - puentes(board,rival(id_Agent),type)/2
    connectsVal =
        countConnects(board, id_Agent) -
        countConnects(board, rival(id_Agent)) / 2;
    result = 4 * puentesVal + connectsVal / 2;
    return result;
}

/**
 * Cuenta la cantidad de puentes en un board.
 * @param {Matrix} board
 * @param {int} id_Agent
 */
function puentes(board = [], id_Agent) {
    //}, type){
    let valor = 0;
    let peso = 1;

    for (let i = 0; i < board.length - 1; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (
                board[i][j] == id_Agent &&
                (board[i][j - 1] !== rival(id_Agent) &&
                    board[i + 1][j - 1] !== rival(id_Agent))
            ) {
                try {
                    if (board[i + 1][j - 2] == id_Agent) {
                        valor = valor + peso;
                        //console.log('Hay un puente a la IZQUIERDA de: ', [i,j], 'es',[i+1,j-2])
                    }
                } catch (e) {}
                try {
                    if (
                        board[i + 2][j - 1] == id_Agent &&
                        (board[i + 1][j - 1] !== rival(id_Agent) &&
                            board[i + 1][j] !== rival(id_Agent))
                    ) {
                        valor = valor + peso;
                        //console.log('Hay un puente ABAJO de: ', [i,j], 'es',[i+2,j-1])
                    }
                } catch (e) {}
                try {
                    if (
                        board[i + 1][j + 1] == id_Agent &&
                        (board[i + 1][j] !== rival(id_Agent) &&
                            board[i][j + 1] !== rival(id_Agent))
                    ) {
                        valor = valor + peso;
                        //console.log('Hay un puente a la DERECHA de: ', [i,j],'es',[i+1],',',[j+1])
                    }
                } catch (e) {}
            }
        }
    }
    //console.log('numero de puentes: ', valor)
    return valor;
}

/**
 * Retorna un arbol de la manera {raiz [hijo1 [hijo1.1, hijo1.2], hijo2 []]}
 * @param {Object} nodo
 * @param {int} id_Agent
 * @param {int} limite
 */
function generarArbol(nodo, id_Agent, limite) {
    let nodoEvaluado = nodo;
    let hash = [];
    /* if (avoidRepeatedState(nodoEvaluado, hash)) {
        agregarHijos(nodoEvaluado, id_Agent);
    } //else console.log('me salte un nodo') */
    agregarHijos(nodoEvaluado, id_Agent);

    if (nodoEvaluado.children[0] == null) {
        console.log('Ningun camino es viable.');
    }
    generarHojas(nodoEvaluado.children, limite, id_Agent, hash);
    return nodo;
}

/**
 * Funcion recursiva que actualiza el array de las hojas del root
 */
function generarHojas(listOfChildren, limite, id_Agent, hash) {
    if (listOfChildren[0] == null) {
        return null;
    }

    if (listOfChildren[0].level == limite) {
        return null;
    } else {
        for (let i = 0; i < listOfChildren.length; i++) {
            //Esto falla si no llega a tener hijos
            agregarHijos(listOfChildren[i], id_Agent);
            if (listOfChildren[i].children[0] == null) {
                console.log(
                    'Dijkstra() failed: Hay un men sin hijos en el nivel: ',
                    listOfChildren[i].level
                );
            }
            listOfChildren[i].children.push(
                generarHojas(listOfChildren[i].children, limite, id_Agent, hash)
            );
            listOfChildren[i].children.pop();
        }
    }
}

/**
 * Copia un board en un clipboard (muy original)
 */
function copyBoard(clipboard, board, pos, id_Agent) {
    let length = board.length;
    for (let i = 0; i < length; i++) {
        clipboard.push([]);
        for (let j = 0; j < length; j++) {
            /* if (board[i][j] != 0) {
                clipboard[i][j] = board[i][j];
            } */
            if (i == pos[0] && j == pos[1]) {
                clipboard[i].push(id_Agent);
            } else clipboard[i].push(board[i][j]);
        }
        //clipboard.push(board[i].slice());
    }
}

/**
 * Es agregar nodo pero con la nueva implementacion :D
 */
function agregarHijos(nodoEvaluado, id_Agent) {
    let board = nodoEvaluado.board;
    let id_Rival = rival(id_Agent);

    let dijkstra = fijkstra(board);

    for (let i = 0; i < dijkstra.length; i++) {
        let v_x = dijkstra[i][0];
        let v_y = dijkstra[i][1];

        if (board[v_x][v_y] == 0) {
            let newBoard = [];

            if (nodoEvaluado.type == 'MAX') {
                copyBoard(newBoard, board, [v_x, v_y], id_Agent);
                nodoEvaluado.children.push(
                    crearHijo(
                        'MIN',
                        nodoEvaluado.level + 1,
                        -nodoEvaluado.utility,
                        newBoard,
                        [v_x, v_y]
                    )
                );
            } else {
                copyBoard(newBoard, board, [v_x, v_y], id_Rival);
                nodoEvaluado.children.push(
                    crearHijo(
                        'MAX',
                        nodoEvaluado.level + 1,
                        -nodoEvaluado.utility,
                        newBoard,
                        [v_x, v_y]
                    )
                );
            }
        }
    }
    id_Rival = rival(id_Rival);
}

/**
 * Funcion minimax que espera un nodo PAPAPAPAPAPA, osea el papa conoce a los hijos
 */
function minimax(node, limite, minMax, id_Agent) {
    let value = 0;
    if ((limite = 0 || node.children[0] == null)) {
        //console.log('valor de la hoja: ',heuristica(node.board, id_Agent))
        return heuristica(node.board, id_Agent);
    }
    if (minMax == 'MAX') {
        value = -infinito;
        for (let i = 0; i < node.children.length; i++) {
            //console.log('evaluando: ',node.children[i])
            value = Math.max(
                value,
                minimax(node.children[i], limite - 1, 'MIN', id_Agent)
            );
            node.utility = value;
        }
        return value;
    } else {
        value = infinito;
        for (let i = 0; i < node.children.length; i++) {
            //console.log('evaluando: ',node.children[i])
            value = Math.min(
                value,
                minimax(node.children[i], limite - 1, 'MAX', id_Agent)
            );
            node.utility = value;
        }
        return value;
    }
}

/**
 * Funcion alfa_Beta que espera un nodo PAPAPAPAPAPA, osea el papa conoce a los hijos
 */

function alfa_Beta(node, limite, a, b, id_Agent) {
    if ((limite = 0 || node.children[0] == null)) {
        //console.log('valor de la hoja: ',heuristica(node.board, id_Agent))
        //console.log('Heuristica: ',node.board)
        //return node.board;
        let utilidad = heuristica(node.board, id_Agent); //, node.type);
        node.utility = utilidad;
        return utilidad;
    }
    if (node.type == 'MAX') {
        for (let i = 0; i < node.children.length; i++) {
            //console.log('evaluando: ',node.children[i])
            a = Math.max(
                a,
                alfa_Beta(node.children[i], limite - 1, a, b, id_Agent)
            );
            node.utility = a;
            if (b <= a) {
                break;
            }
        }
        return a;
    } else {
        for (let i = 0; i < node.children.length; i++) {
            //console.log('evaluando: ',node.children[i])
            b = Math.min(
                b,
                alfa_Beta(node.children[i], limite - 1, a, b, id_Agent)
            );
            node.utility = b;
            if (b <= a) {
                break;
            }
        }
        return b;
    }
}

/**
 * Crea un Nodo con la nueva implementacion
 */
function crearHijo(type, level, utility, board, action) {
    let node = {
        type: type,
        level: level,
        children: [],
        utility: utility,
        board: board,
        action: action,
    };
    return node;
}

/**
 * Dado el nodo padre, busca en sus primeros hijos cual es el que coicide con el valor maximo y retorna su accion
 *
 */
function retornarPosition(nodo, value) {
    for (let i = 0; i < nodo.children.length; i++) {
        if (nodo.children[i].utility == value) {
            return nodo.children[i].action;
        }
    }
}

/**
 * Devuelve las primeras 4 posiciones disponibles
 *
 */
function fijkstra(board) {
    // false dijkstra
    let available = getHexAt(board, 0);
    let length = available.length; //return dijkstra;
    /* 
        available.splice(Math.round(Math.random() * (length - 1)), 1)[0],
        available.splice(Math.round(Math.random() * (length - 2)), 1)[0],
       for (let i = 0; i < length-37; i++) {
        dijkstra.push(available[i]);
    } */
    /* let dijkstra = [
        available[3],
        available[0],
        available[2],
        available[1],
        available[4],
        available[6],
        available[7],
        available[5],
        available[9],
        available[8],
        available[10],
        available[11],
    ];  */ return available;
}
