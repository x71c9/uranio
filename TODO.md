#### BOOK VALIDATION

In order to make the access control layer works ->

If an atom has security type UNIFORM and `_r !== undefined` -> all the reference
of it as subatom must be optional in the case it cannot be accessible by the user.

--

Check if Atom reference type are on the same connection

--

Check if AuthAtom have email, password and groups non-optional.

--

Check api URL must be unique

--

Check if bll return function return bll classes

// if(
//   'bll' in atom_def &&
//   atom_def.bll &&
//   typeof atom_def.bll === 'function' &&
//   atom_def.bll().prototype &&
//   atom_def.bll().prototype.constructor.name === 'BLL'
// ){
//   return new (atom_def.bll())(token_object) as CustomBLL<A>;
// }else{
//   return new BLL<A>(atom_name, token_object) as CustomBLL<A>;
// }

#### CONF VALIDATION

Check that jwt private key is changed.

--


