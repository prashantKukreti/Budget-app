
// Data budget controller
var budgetController = (function(){

    var Expenses=function(id,description,value){
        this.id = id;
        this.description= description;
        this.value= value;
        this.percentage=-1;

    }

    var Income=function(id,description,value){
        this.id = id;
        this.description= description;
        this.value= value;

    }

    Expenses.prototype.calcPercentage= function(){
        
        // percentage = expense/totalincome *100;
        if(data.totals.inc>0){
            this.percentage = Math.round((this.value/data.totals.inc)*100);
        }
        else
        this.percentage=-1;
    }

var data = {
    allItems:{
        inc:[],
        exp:[]
    },
    totals:{
        inc:0,
        exp:0
    },
    budget:0,
    percentage:-1
}

var calculateTotal = function(type){
    var sum=0;
    data.allItems[type].forEach(function(cur){
        sum+= cur.value;
    });
    data.totals[type]=sum;

}


return{
    addItem: function(type,desc,val){
        var newItem,ID
        // create new ID
        if (data.allItems[type].length!==0){
            ID=data.allItems[type][data.allItems[type].length-1].id+1;
        }
        else ID =0; 
    //    create an item based on inc or exp type and push it into the data structure
    if(type==='inc'){
        newItem = new Income(ID,desc,val);
    }
    else if (type==='exp')
    {
        newItem = new Expenses(ID,desc,val);
    }
    data.allItems[type].push(newItem);

    return newItem;
    },
    testing: function(){
        // console.log(data);
        return data;
    },

    calculateBudget :function(){

        // calculate total income and total expenses
        calculateTotal('exp');
        calculateTotal('inc');
        
        // total income-total expenses = budget
        data.budget= data.totals.inc-data.totals.exp;

        // calculate the percentage income 
        if(data.totals.inc>0)
        {data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
           }
        else
        data.percentage=-1;   
    
    },
    getBudget: function(){
        console.log(data)
        return{

            budget: data.budget,
            totalInc:data.totals.inc,
            totalExp:data.totals.exp,
            percentage:data.percentage
        }
    },

    calculatePercentages: function(){
        data.allItems.exp.forEach(function(cur){
            cur.calcPercentage();

        });
    },

    getPercentages: function(){
        var allPerc = data.allItems.exp.map(function(cur){
            return cur.percentage;

        });
        return allPerc;
    },

    deleteItem: function(id,type){
        var ids;
        ids =data.allItems[type].map(function(current){
            return current.id;
        });

        index = ids.indexOf(id);
        if(index!==-1)
        data.allItems[type].splice(index,1);                                                                              
    }
    



}

})();

// UI controller

var uiController = (function(){
    // get values from the user

    var nodeListforEach= function(list,callback){
        for(i=0;i<list.length;i++){
             callback(list[i],i);
        }

    };

    var formatNumber = function(num,type){

        num= Math.abs(num);
        num= num.toFixed(2);
        splitNum = num.split('.');
        
        int = splitNum[0];
        dec= splitNum[1];

        if(int.length>3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }



        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */
        

        return (type==='exp'?'-':'+') + int +'.'+dec;

    };
    
   return {
        getInput:function(){
            return {
            type: document.querySelector('.add__type').value,
            desc: document.querySelector('.add__description').value,
            value:parseFloat(document.querySelector('.add__value').value)
            }   
        
        },
        addListItem: function(obj,type){
            var html,newhtml,element;
             // create an html string with placeholders
            if(type === 'inc'){
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type ==='exp'){
                element = '.expenses__list';
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // replace the placeholders with item data
            newhtml= html.replace('%id%',obj.id);
            newhtml= newhtml.replace('%description%',obj.description);
            newhtml=newhtml.replace('%value%',formatNumber(obj.value,type));
            // insert that into DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newhtml);
        },

        deleteListItem:function(selectorID){
            
            document.getElementById(selectorID).remove();
            // document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));

        },
        clearFields: function(){
            var fields = document.querySelectorAll('.add__description,.add__value');
            
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value='';

            fieldsArr[0].focus();

            });
        },
        displayBudget: function(obj){
            var type;
            obj.budget>0? type='inc':type='exp';

            document.querySelector('.budget__value').textContent=formatNumber(obj.budget,type);
            document.querySelector('.budget__income--value').textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector('.budget__expenses--value').textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0){
            document.querySelector('.budget__expenses--percentage').textContent=obj.percentage+'%';}
            else
            document.querySelector('.budget__expenses--percentage').textContent='--';
        },
        displayPercentages: function(percentages){
            var fields =document.querySelectorAll('.item__percentage');

            nodeListforEach(fields,function(current, index){
                if(percentages[index]>0){
                    current.textContent = percentages[index]+'%';
                }
                else
                current.textContent='--';
        });
        },
        changeType: function(){
            document.querySelector('.add__type').classList.toggle('red-focus');
            document.querySelector('.add__description').classList.toggle('red-focus');
            document.querySelector('.add__value').classList.toggle('red-focus');
            document.querySelector('.add__btn').classList.toggle('red');

        },
        displayMonth: function(){
            var now, months, month, year;

            now= new Date();
            months = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();
            year = now.getFullYear();

            // console.log(now.getMonth());
            document.querySelector('.budget__title--month').textContent=months[month]+' '+year+ ' ';
        }
       
   }
})();

// App controller

var controller =(function(budgetCntrl,UIcntrl){
    // Add event listener to button
    
    var setupEventListeners=function(){   
    // console.log("Event are being handled");
    document.querySelector('.add__btn').addEventListener('click',cntrlAddItem );
    document.addEventListener('keypress',function(event){
        if(event.keyCode ===13){
            cntrlAddItem();
        }
     });

    document.querySelector('.container').addEventListener('click',cntrlDeleteItem);
    };
    document.querySelector('.add__type').addEventListener('change',UIcntrl.changeType);


    var updateBudget = function(){

        // calculate the budget 
        budgetCntrl.calculateBudget();

        var budget= budgetCntrl.getBudget();

        //display budget to UI
        UIcntrl.displayBudget(budget);
        
    };

    var updatePercentages= function(){
        //calculate the percentages for each exp object and put them in data structure.
        budgetCntrl.calculatePercentages();

        //get the budget form the data structure
        var percentages=budgetCntrl.getPercentages();

        //display budget on ui
        UIcntrl.displayPercentages(percentages);
    };
    var cntrlAddItem =function(){
        // console.log('it works')
        var input, newItem;
        // get the field input data
        input= UIcntrl.getInput();
        // if fileds are not empty proceed further
        if(input.desc!==''&& !isNaN(input.value)&& input.value>0){ 
    
        // Add the item to budget controller
        newItem = budgetCntrl.addItem(input.type,input.desc,input.value);
        
        // Add item to UI 
        UIcntrl.addListItem(newItem,input.type);
        //clear the input filed
        UIcntrl.clearFields();

        updateBudget();
        // update the percentages for each expense
        updatePercentages();
        
    }

    };

    var cntrlDeleteItem = function(event){
        var itemID,splitID,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
        splitID = itemID.split('-');
        type = splitID[0];
        ID= parseInt(splitID[1]);
        
        // delete item form data structure 
        budgetCntrl.deleteItem(ID,type);
        // delete item from ui
    
        UIcntrl.deleteListItem(itemID);
        // recalculate budget and update ui
        updateBudget();
        // recalculate the percentage and update ui
        updatePercentages();

        }
    };



    return{
        init: function(){
            console.log("Application has started")
            UIcntrl.displayMonth();
            UIcntrl.displayBudget({budget: 0,
                totalInc:0,
                totalExp:0,
                percentage:-1});
            setupEventListeners();
        }
    };
  

})(budgetController,uiController);

controller.init();