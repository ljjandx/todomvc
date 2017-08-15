;(function (Vue) {
  // const todos = [
  //   {id:1, title: '吃饭', completed: true},
  //   {id:2, title: '睡觉', completed: false},
  //   {id:3, title: '打豆豆', completed: true},
  // ];
  
  const todos = JSON.parse(window.localStorage.getItem('todos') || '[]');

  const filter = {
    all : () => todos,
    active: () => todos.filter(t => !t.completed),
    completed: () => todos.filter(t => t.completed)
  }
    
  Vue.directive('focus', {
    // 当绑定元素插入到 DOM 中。
    inserted: function (el) {
      // 聚焦元素
      el.focus()
    }
    // componentUpdated: function(el){
    //   el.focus()
    // }
  })

	const vm = new Vue({
    el: '#app',
    data: {
      titleText: '',
      allCompleted: false,
      currentEdit: null,
      currentEditText: '',
      todos: todos,
      filterTodos: filter.all(),
      path: 'all'
    },
    watch: {
      todos : {
        handler (val) {
          this.filterTodos = filter[this.path]();
          // 将内存中的todos持久化到本地存储
          window.localStorage.setItem('todos',JSON.stringify(val));
        },
        deep: true
      }
    },
    methods: {
      addTodo(){
        this.allCompleted = false;
        let [title, todos, id=1] = [this.titleText.trim(), this.todos];
        if(title.length === 0) return;

        //设置id值为todos数组的最后一项的id减一，如果列表为空，则id设为1
        const lastTodo = todos[todos.length - 1];
        lastTodo && (id = lastTodo.id + 1);

        todos.push({
          id,
          title,
          completed: false
        });

        this.titleText = '';
      },
      toggleAll(){
        //遍历所有的todos将每一项的completed的值设置为allCompleted的值
        this.todos.forEach(t => t.completed = this.allCompleted);
      },
      toggle(){
        this.allCompleted = this.todos.every(t => t.completed);
      },
      removeTodo(id){
        const removeIndex = this.todos.findIndex(t => t.id === id);
        this.todos.splice(removeIndex,1);
      },
      // 双击进入获得编辑样式
      getEditing(todo){
        this.currentEdit = todo;
        this.currentEditText = todo.title;
      },
      // 敲回车退出编辑样式
      saveTodo(todo){
        this.currentEdit = null;
        if(this.currentEditText.trim().length === 0) return;
        todo.title = this.currentEditText;
      },
      // 按下esc键取消编辑
      cancelEdit(todo){
        this.currentEdit = null;
      },
      // 获取所有未完成任务数量
      // 可以用计算属性代替
      /*getRemainingCount(){
        let count = 0;
        // this.todos.forEach(t => !t.completed && count++);
        // return count;
        // 可以简写
        return (this.todos.forEach(t => !t.completed && count++),count);
      }*/
      // 清除所有已完成数
      clearAllCompleted(){
        const todos = this.todos;
        for(let i = 0;i < todos.length; i++){
          todos[i].completed && (todos.splice(i,1),i--);
        }
      }
    },
    directives: {
      'todoFocus': {
        update(el,binding){
          if(binding.value.todo === binding.value.currentEdit){
            el.focus();
          }
        }
      }
    },
    // 钩子函数获取焦点，不推荐
    // mounted(){ document.getElementById("titleText").focus();
    // }
    
    computed: {
      remainingCount(){
        let count = 0;
        return (this.todos.forEach(t => !t.completed && count++),count)
      }
    }
  })
  window.onhashchange = () => {
    // 获取hash值，去掉#/
    let hash = window.location.hash.substr(2);
    // 处理hash值，如果为空，默认为all
    hash = hash === "" ? "all" : hash;
    vm.path = hash;
    // 如果有filter[hash]这个属性，则调用
    vm.filterTodos = filter[hash] && typeof filter[hash] === 'function' && filter[hash]();

    /*const hash = window.location.hash.substr(1);
    switch(hash){
      case '/':
        app.filterTodos = filter.all();
        console.log( filter.all() );
        break;
      case '/active':
        app.filterTodos = filter.active();
        console.log( filter.active() );
        break;
      case '/completed':
        app.filterTodos = filter.completed();
        console.log( filter.completed() );
        break;
    }*/
  }

  // 页面首次加载时处理全选得选中状态
  vm.allCompleted = vm.todos.every(t => t.completed);

  // 第一次进来就执行一次
  window.onhashchange();

})(Vue);
