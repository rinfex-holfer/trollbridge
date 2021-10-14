import {O_Container} from "./container";
import {O_Sprite} from "./sprite";
import {O_AnimatedSprite} from "./animated-sprite";
import {O_Text} from "./text";
import {O_Tiles} from "./tiles";

export type O_GameObject = O_Container | O_Sprite | O_AnimatedSprite | O_Text | O_Tiles;