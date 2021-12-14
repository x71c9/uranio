#### URANIO ADMIN

Search methods

Filters properties

Bulk edit

Buld delete

Live request visualizer

CSS transition

Responsive

##### Media

Drop file and upload

Multiple file upload

Crop and resize

Compress image before upload

Effects on images

Pixellate for privacy

Annotate


#### SERVER UPLOAD MEDIA

Where to store media?

How to upload media?

#### MOVE TO GITHUB


#### IMPORT EXPORT

Import export with CSV files

#### EDIT DB

Excel in browser?

#### API BEHIND AUTH

Develop calls behind authorization and authentication.


#### DEFAULT CALL INJECTIONS

Develop 'pre' and 'post' injection to default calls: `find`, `update`, `insert`, ...


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

--

Cannot use route with default names: find, find_id, find_one, insert, update, delete

--

Do not override atom_hard_propeties

--

properties on_error shouldn't call any server function. ?

--

#### CONF VALIDATION

Check that jwt private key is changed.

--


#### FASTER DEV EXPRIENCE?

