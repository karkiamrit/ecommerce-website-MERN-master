class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }/*query ma k kam garne tyo auxa(eg Product.find()) i.e a function, 
    queryStr ma chai hami kei define garxau eg 'www.ac.com?keyword=samosa'
    ya keyword hamle kei key ko name define garem ani tesma kunai value auxa yo eg ko case ma samosa , so aba samosa search garne 
    */
    search()
    {
        const keyword=this.queryStr.keyword?{
            name:{
 //regular expression =$regex mongodb ko ho
                $regex:this.queryStr.keyword,
                $options: "i" //i matlab case insensitive
    },
    }:{}; 
        this.query=this.query.find({...keyword});//this.query=Product.find lai yo line lechange gardinxa to Product.find({...keyword})
        return(this);

        
        
    }
    filter(){
          const queryCopy ={...this.queryStr}; // ya spread operator le garda object ko reference nabhayera actual object nei use garna paiyo jasle garda changes to queryCopy doesnt affect queryStr
//Removing some fields for category (category hisab le product filter garna)
          const removeFields=["keyword","page","limit"];//yo tinta kura lai remove garne so that category field matra pass hos
          removeFields.forEach(key=>delete queryCopy[key]);
         //ya this.query le Product.find() lai janauxa
        // ***filter generally price,category le hunxa so teti khera hamlai extra ako keyword page jasta field haru hatako ko
         //check garna remove field paxi ra suruma console.log(queryCopy garda hunxa)

//Filter for price and Rating
        //first ma object lai string ma lageko kam garna ani feri object mai lagne last ma 
        let queryStr=JSON.stringify(queryCopy);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key =>`$${key}`);//gt=greater than, gte=greater than equal to
        //mongodb le $ linxa variable agadi ko url bata ako gt lt for price and rating filter lai $ form ma lageko
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    
    pagination(resultPerPage){
            const currentPage=Number(this.queryStr.page) || 1;
            //50 product xa database ma bhane suruko page ma 0 skip 1st page ma 5 skip and so on
            const skip= resultPerPage * (currentPage -1); //yedi result per page 5 xa ani current page 2 xa bhane (5*(2-1)=5 ota first ko item skip garne 2nd page ma)
            this.query= this.query.limit(resultPerPage).skip(skip);
            return this;
    }   

}
module.exports= ApiFeatures;