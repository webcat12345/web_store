<?php
if (isset($this->session->userdata['logged_in'])) {
    redirect(show_article);
}
?>

<div id = "login_main">
    <div id = "login">
        <?php
            echo form_open('user_login/user_login_process');
        ?>
        <h2>Login Form</h2>
        </hr>
        <?php
            echo "<div class = 'error_msg'>";
            if (isset($error_message)){
                echo $error_message;
            }
            echo validation_errors();
            echo "</div>";
        ?>
        <label>UserName :</label>
        <input type = "text" name = "username" id = "name" placeholder="username"/><br/><br/>
        <label>Password :</label>
        <input type = "password" name = "password" id = "password" placeholder="***********"/><br/><br/>
        <input type = "submit" value = "LOGIN" name = "submit"/><br/>
        <?php
            echo form_close();
        ?>
    </div>
</div>