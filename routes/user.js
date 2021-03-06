const { response } = require('express');
var express = require('express');
const { USER_COLLECTION } = require('../config/collections');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers');

const varifylogin=(req,res,next)=>{
  if(req.session.LoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null
  if(req.session.user){
     cartCount=await userHelpers.getCartCount(req.session.user._id)
  }

  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount})
   })
});

router.get('/login',(req,res)=>{
if(req.session.LoggedIn){
  res.redirect('/')
}else
    res.render('user/login',{"loginErr":req.session.loginErr})
   req.session.loginErr=false
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    req.session.LoggedIn=true
    req.session.user=response
 res.redirect('/login')
  } )
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.LoggedIn=true
      req.session.user=response.user

      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or Password"
      res.redirect('/login')
    }
  })

})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',varifylogin,async(req,res)=>{
let products=await userHelpers.getCartProducts(req.session.user._id)

  res.render('user/cart',{products,user:req.session.user})
})

router.get('/add-to-cart/:id',(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(()=>{
    console.log(req.body)
  })


})

module.exports = router;
