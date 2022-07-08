;(function(){
    /*
	0 - пустое место
	1 - палуба корабля
	2 - клетка рядом с кораблём
	3 - обстрелянная клетка
	4 - попадание в палубу
	*/

	// флаг начала игры, устанавливается после нажатия кнопки 'Play' и запрещает
	// редактирование положения кораблей
	let startGame = false;
	let gameOver = false;
	// флаг установки обработчиков событий ведения морского боя
	let isHandlerController = false;
	// флаг, блокирующий действия игрока во время выстрела компьютера
	let compShot = false;

	// получаем объект элемента DOM по его ID
	const getElement = id => document.getElementById(id);
	// n - максимальное значение, которое хотим получить
	const getRandom = n => Math.floor(Math.random() * (n + 1));
	usernameInput

    // игровое поле игрока
	const humanfield = getElement('player_field');
	// игровое поле компьютера
	const computerfield = getElement('comp_field');

	const username = getElement('usernameInput');

	const flex_row = document.querySelector('.flex-row');

    class Field {

		static FIELD_SIDE = 320;
		static CELL_SIDE = 30;

		static ships = [
			[4, 1],
		 	[3, 2], 
			[2, 3], 
			[1, 4]
		];
		constructor(field){
			this.field = field;
			this.matrix = [];
		}
		//Создание матрицы, заполненной нулями
		createMatrix() {
			this.matrix = new Array(10).fill(0).map(() => new Array(10).fill(0));
		}
		//Обновление матрицы
		updateField() {

			while (this.field.firstChild) {
				this.field.removeChild(this.field.firstChild);
			}
			this.createField(this.matrix);
			
			
		}
		//Создание представления поля
		createField(matrix) {
			this.field.style.width = Field.FIELD_SIDE + 'px';
			this.field.style.height = Field.FIELD_SIDE + 'px';
			const newCell = document.createElement('div');
			newCell.classList.add(String(this.field.id));
			newCell.classList.add('cell');
			
			newCell.style.width = Field.CELL_SIDE + 'px';
			newCell.style.height = Field.CELL_SIDE + 'px';
			newCell.style.background = 'skyblue';
			
			
			for(let i = 0; i < matrix.length; i++){

				for(let j = 0; j < matrix[i].length; j++){
					let cloneNode = newCell.cloneNode(true);
					cloneNode.dataset.x = i;
					cloneNode.dataset.y = j;
					switch(matrix[i][j]) {
						
						case 0:
							this.field.append(cloneNode);
						  	break;
					  
						case 1:
							if (this.field.id === "player_field"){
								cloneNode.style.background = 'blue';
							} else if (gameOver){
								cloneNode.style.background = 'blue';
							}
							this.field.append(cloneNode);
						  	break;
						
						case 2:
							if (this.field.id === "player_field"){
								cloneNode.style.background = 'lightblue';
							} else if (gameOver){
								cloneNode.style.background = 'lightblue';
							}
							// if (this.field.id !== "comp_field"){
							// 	cloneNode.style.background = 'orangered';
							// }
						  	this.field.append(cloneNode);
						  	break;

						case 3:
							cloneNode.style.background = 'gray';
							this.field.append(cloneNode);
							break; 

						case 4:
							cloneNode.style.background = 'red';
							this.field.append(cloneNode);
							break;
					  
						default:
							this.field.append(cloneNode);
						  	break;
					  }
					
					
				}
			}
		}
		// Создание корабля со всеми проверками
		createShip(ship){
			let count = 0;
			if (ship.vert) {

				while (count < ship.decks) {

					this.matrix[ship.x + count][ship.y] = 1;
					ship.coordMat.push([ship.x + count, ship.y]);
					count++;
					

				}

				if((ship.coordMat[0][0]-1 >= 0)) {
					this.matrix[ship.coordMat[0][0]-1][ship.coordMat[0][1]] = 2;
				}
				if((ship.coordMat[ship.coordMat.length-1][0]+1 < this.matrix.length)) {
					this.matrix[ship.coordMat[ship.coordMat.length-1][0]+1][ship.coordMat[0][1]] = 2;
				}
				
				for (let i = ship.coordMat[0][0]; i <= ship.coordMat[ship.coordMat.length-1][0]; i++) {

					if((ship.coordMat[0][1]-1 >= 0) && (i-1 >= 0)) {
						this.matrix[i-1][ship.coordMat[0][1]-1] = 2;
					}
					if((ship.coordMat[0][1]-1 >= 0)) {
						this.matrix[i][ship.coordMat[0][1]-1] = 2;
					}
					if((ship.coordMat[0][1]-1 >= 0) && (i+1 < this.matrix.length)) {
						this.matrix[i+1][ship.coordMat[0][1]-1] = 2;
					}
					
					if((ship.coordMat[0][1]+1 < this.matrix.length) && (i-1 >= 0)) {
						this.matrix[i-1][ship.coordMat[0][1]+1] = 2;
					}
					if((ship.coordMat[0][1]+1 < this.matrix.length)) {
						this.matrix[i][ship.coordMat[0][1]+1] = 2;
					}
					if((ship.coordMat[0][1]+1 < this.matrix.length) && (i+1 < this.matrix.length)) {
						this.matrix[i+1][ship.coordMat[0][1]+1] = 2;
					}

				}
			} else {

				while (count < ship.decks) {

					this.matrix[ship.x][ship.y + count] = 1;
					ship.coordMat.push([ship.x, ship.y + count]);
					count++;
					

				}
				
				if((ship.coordMat[0][1]-1 >= 0)) {
					this.matrix[ship.coordMat[0][0]][ship.coordMat[0][1]-1] = 2;
				}
				if((ship.coordMat[ship.coordMat.length-1][1]+1 < this.matrix.length)) {
					this.matrix[ship.coordMat[0][0]][ship.coordMat[ship.coordMat.length-1][1]+1] = 2;
				}
				
				for (let i = ship.coordMat[0][1]; i <= ship.coordMat[ship.coordMat.length-1][1]; i++) {

					if((ship.coordMat[0][0]-1 >= 0) && (i-1 >= 0)) {
						this.matrix[ship.coordMat[0][0]-1][i-1] = 2;
					}
					if((ship.coordMat[0][0]-1 >= 0)) {
						this.matrix[ship.coordMat[0][0]-1][i] = 2;
					}
					if((ship.coordMat[0][0]-1 >= 0) && (i+1 < this.matrix.length)) {
						this.matrix[ship.coordMat[0][0]-1][i+1] = 2;
					}
					
					if((ship.coordMat[0][0]+1 < this.matrix.length) && (i-1 >= 0)) {
						this.matrix[ship.coordMat[0][0]+1][i-1] = 2;
					}
					if((ship.coordMat[0][0]+1 < this.matrix.length)) {
						this.matrix[ship.coordMat[0][0]+1][i] = 2;
					}
					if((ship.coordMat[0][0]+1 < this.matrix.length) && (i+1 < this.matrix.length)) {
						this.matrix[ship.coordMat[0][0]+1][i+1] = 2;
					}

				}
			
			}

		}

		checkLocationShip(obj, decks) {
			let count = 0;
			if (obj.vert) {
				while (count < decks) {
					
					if (this.matrix[obj.x + count][obj.y] == 1 || this.matrix[obj.x + count][obj.y] == 2 || obj.x + count > 9) {
						return false;
					}
					count++;
				}
				
			} else {
				while (count < decks) {
					
					if (this.matrix[obj.x][obj.y + count] == 1 || this.matrix[obj.x][obj.y + count] == 2 || obj.y + count > 9) {
						return false;
					}
					count++;
				}
				
			}
			return true;

		}

		//ships = [[4, 1], [3, 2], [2, 3], [1, 4]];
		randomLocationShips() {
			for (let i=0; i < Field.ships.length; i++) {
				// кол-во палуб у корабля данного типа
				let decks = Field.ships[i][0];
				// кол-во кораблей данного типа
				let count = Field.ships[i][1];
				
				// прокручиваем кол-во кораблей
				for (let i = 0; i < count; i++) {
					// получаем координаты первой палубы и направление расположения палуб (корабля)
					let options = this.getRandomOptions(decks);
					const ship = new Ship(options.x, options.y, decks, options.vert);
					this.createShip(ship);
				}
			}
		}

		getRandomOptions(decks) {
			// получаем направление расположения корабля

			let vert = Boolean(getRandom(1));
			let x, y;

			// в зависимости от направления расположения, генерируем
			// начальные координаты
			if (vert) {
				x = getRandom(10 - decks); y = getRandom(9);
			} else {
				x = getRandom(9); y = getRandom(10 - decks);
			}

			const obj = {x, y, vert}
			// проверяем валидность координат всех палуб корабля
			const result = this.checkLocationShip(obj, decks);
			// если координаты невалидны, снова запускаем функцию
			if (!result) return this.getRandomOptions(decks);
			return obj;

		}


	}

	class Ship {

		constructor(x, y, decks, vert = false) {
			if(x >= 0 && x < 10) {
				this.x = x;
			}
			else {
				console.log("Вы не можете расположить корабль в этом месте");
			}
			if(y >= 0 && y < 10) {
				this.y = y;
			}
			else {
				console.log("Вы не можете расположить корабль в этом месте");
			}
			if(decks >= 1 && decks < 5) {
				this.decks = decks;	
			}
			else {
				console.log("Вы не можете создать корабль без палуб или больше, чем 4");
			}
					
			this.vert = vert;

			this.coordMat = [];
		}


	}

	class Controller {

		// Блок, в который выводятся информационные сообщения по ходу игры
		static SERVICE_TEXT = getElement('service_text');

		constructor() {
			this.player = '';
			this.opponent = '';
			this.text = '';
			// массив с координатами выстрелов при рандомном выборе
			this.coordsRandomHit = [];
		}

		// вывод информационных сообщений
		static showServiceText = text => {
			Controller.SERVICE_TEXT.innerHTML = text;
		}

		

		init() {
			// Рандомно выбираем игрока и его противника
			const random = getRandom(1);
			this.player = (random == 0) ? human : computer;
			this.opponent = (this.player === human) ? computer : human;

			// генерируем координаты выстрелов компьютера 
			this.setCoordsShot();

			// обработчики события для игрока
			if (!isHandlerController) {
				//выстрел игрока
				computerfield.addEventListener('click', this.makeShot.bind(this));
				isHandlerController = true;
			}

			if (this.player === human) {
				compShot = false;
				this.text = 'Вы стреляете первым';
			} else {
				compShot = true;
				this.text = 'Первым стреляет компьютер';
				// выстрел компьютера
				setTimeout(() => this.makeShot(), 2000);
			}
			Controller.showServiceText(this.text);
		}

		

		checkUselessCell(coords) {
			// данная строчка кода используется при установке маркера игроком
			// если значение матрицы по полученным координатам отлично от нуля,
			// считаем, что в этом месте уже установлена некая иконка  
			if (computer.matrix[coords[0]][coords[1]] > 2) {
				return false;
			} else {
				return true;
			}

			// получаем коллекцию маркеров на игровом поле противника
			
		}

		setCoordsShot() {
			// получаем координаты каждой клетки игрового поля
			// и записываем их в массив
			for (let i = 0; i < 10; i++) {
				for(let j = 0; j < 10; j++) {
					this.coordsRandomHit.push([i, j]);
				}
			}
			// рандомно перемешиваем массив с координатами
			this.coordsRandomHit.sort((a, b) => Math.random() - 0.5);

		}

		// удаление ненужных координат из массива
		static removeElementArray = (arr, [x, y]) => {
			return arr.filter(item => item[0] != x || item[1] != y);
		}

		getCoordsForShot() {
			const coords = this.coordsRandomHit.pop();	
			// удаляем полученные координаты из всех массивов
			this.coordsRandomHit = Controller.removeElementArray(this.coordsRandomHit, coords);
			return coords;
		}

		transformCoordsInMatrix(e, self) {

			const target = self.getBoundingClientRect();

			// let x = e.clientX - target.left;
			// let y = e.clientY - target.top;

			const x = Math.trunc((e.pageY - target.top ) / (Field.CELL_SIDE + 2));
			const y = Math.trunc((e.pageX - target.left ) / (Field.CELL_SIDE + 2));

			return [x, y];
		}


		makeShot(e) {
			let x, y;
			// если событие существует, значит выстрел сделан игроком
			if (e !== undefined) {
				// если клик не левой кнопкой мыши или установлен флаг compShot,
				// что значит, должен стрелять компьютер
				if (e.which != 1 || compShot) return;
				// координаты выстрела в системе координат матрицы
				([x, y] = this.transformCoordsInMatrix(e, this.opponent.field));

				// проверяем, можно ли выстрелить по полученным координатам
				const check = this.checkUselessCell([x, y]);
				if (!check || gameOver) return;
			} else {
				// получаем координаты для выстрела компьютера
				([x, y] = this.getCoordsForShot());
			}

			const v	= this.opponent.matrix[x][y];
			switch(v) {
				case 0: // промах
				case 2:
					this.miss(x, y);
					break;
				case 1: // попадание
					this.hit(x, y);
					break;
				case 3: // повторный обстрел
				case 4:
					Controller.showServiceText('По этим координатам вы уже стреляли!');
					break;
			}
		}

		miss(x, y) {
			let text = '';
			// устанавливаем иконку промаха и записываем промах в матрицу
			this.opponent.matrix[x][y] = 3;
			this.opponent.updateField();

			// определяем статус игроков
			if (this.player === human) {
				text = 'Вы промахнулись. Стреляет компьютер.';
				this.player = computer;
				this.opponent = human;
				compShot = true;
				setTimeout(() => this.makeShot(), 500);
			} else {
				text = 'Компьютер промахнулся. Ваш выстрел.';
				this.player = human;
				this.opponent = computer;
				compShot = false;
			}
			setTimeout(() => Controller.showServiceText(text), 400);
		}

		isGameOver(opponent){
			let count = 0;
			opponent.matrix.forEach((row) => {
				row.forEach((col) => {
					if (col == 1){
						count++;
					}
				});
			});
			if (count == 0) {
				return true;
			} else {
				return false;
			}
		}

		hit(x, y) {
			let text = '';
			this.opponent.matrix[x][y] = 4;
			this.opponent.updateField();
			// выводим текст, зависящий от стреляющего
			text = (this.player === human) ? 'Поздравляем! Вы попали. Ваш выстрел.' : 'Компьютер попал в ваш корабль. Выстрел компьютера';
			setTimeout(() => Controller.showServiceText(text), 400);


			

			// все корабли эскадры уничтожены
			if (this.isGameOver(this.opponent)) {
				gameOver = true;
				if (this.opponent === human) {
					text = 'К сожалению, вы проиграли.';
					this.player.updateField();
				} else {
					text = 'Поздравляем! Вы выиграли!';
				}
				
				Controller.showServiceText(text);
				// показываем кнопку новой игры
				buttonNewGame.hidden = false;
			// бой продолжается
			} else if (this.opponent === human) {

				// после небольшой задержки, компьютер делает новый выстрел
				setTimeout(() => this.makeShot(), 500);
			}
		}
	}


	// родительский контейнер с инструкцией
	const instruction = getElement('instruction');
	// контейнер с заголовком
	const toptext = getElement('text_top');

	const error = getElement('error');
	// кнопка начала игры
	const buttonPlay = getElement('play-button');
	// кнопка перезапуска игры
	const buttonNewGame = getElement('newgame-button');

	human = new Field(humanfield);
	human.createMatrix();
	human.createField(human.matrix);
	human.randomLocationShips();
	human.updateField();

	computer = {};


	let control = null;

	buttonPlay.addEventListener('click', function(e) {


		if (username.value == "") {
			Controller.SERVICE_TEXT.innerHTML = 'Введите имя пользователя. Пожалуйста)';
			return;
		} else {
			Controller.SERVICE_TEXT.innerHTML = "";
			let user = ` : Игрок ${username.value}`;
			toptext.innerHTML += user;
			username.value = "";
			username.hidden = true;
		}

		// скрываем не нужные для игры элементы
		buttonPlay.hidden = true;
		instruction.hidden = true;
		// показываем игровое поле компьютера
		computerfield.hidden = false;
		flex_row.style.justifyContent = 'space-evenly';

		
		

		// создаём экземпляр игрового поля компьютера
		computer = new Field(computerfield);
		// очищаем поле от ранее установленных кораблей
		computer.createMatrix();
		computer.createField(computer.matrix);
		computer.randomLocationShips();
		computer.updateField();
		// устанавливаем флаг запуска игры
		startGame = true;

		// создаём экземпляр контроллера, управляющего игрой
		if (!control) control = new Controller();
		// запускаем игру
		control.init();
	});

	buttonNewGame.addEventListener('click', function(e) {
		
		toptext.innerHTML = "Морской бой";
		// скрываем кнопку перезапуска игры
		buttonNewGame.hidden = true;
		buttonPlay.hidden = false;
		
		flex_row.style.justifyContent = 'center';
		computerfield.innerHTML = "";
		computerfield.style.width = "";
		computerfield.style.height = "";
		username.hidden = false;
		

		instruction.hidden = false;
		
		human.createMatrix();
		human.createField(human.matrix);
		human.randomLocationShips();
		human.updateField();
		Controller.SERVICE_TEXT.innerHTML = 'Введите имя пользователя.';

		// устанавливаем флаги в исходное состояние
		compShot = false;
		gameOver = false;
		startGame = false;

		computer = {};

		// обнуляем массивы с координатами выстрела
		control.coordsRandomHit = [];
	});


})();