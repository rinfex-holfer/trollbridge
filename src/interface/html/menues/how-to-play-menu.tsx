import React from "react";
import {MenuTemplate} from "../components/menu-template";
import {MenuButtonBack} from "../components/menu-button-back";

export const HowToPlayMenu = () => {
    return <MenuTemplate title="How to play">
        <MenuButtonBack/>
        <div className='how-to-play__instructions'>
            <h2>Характеристики тролля:</h2>
            <ul>
                <li><b>Уровень</b>: максимум 5. Опыт увеличивается от успешного грабежа путников.</li>
                <li><b>Здоровье</b>: восстанавливается едой и сном</li>
                <li><b>Голод</b>: если поднимется до максимума, а здоровье опустится до нуля - вы проиграете</li>
                <li><b>Самоконтроль</b>: уменьшается от поедания сырого и человеческого мяса. Чем меньше - тем выше
                    шанс впадения в ярость.
                </li>
                <li><b>"Страшность"</b>: насколько вас боятся в округе. Чем выше - тем больше шанс того, что путники
                    заплатят без боя. Но также и того, что тролля придут истреблять.
                </li>
            </ul>

            <h2>Как манипулировать едой (пока что неудобно, да):</h2>
            <ul>
                <li>ЛКМ - положить на сушилку или съесть</li>
                <li>ПКМ - снять с сушилки или выкинуть</li>
            </ul>

            <h2>Постройки</h2>
            <ul>
                <li><b>Котел</b>: позволяет готовить еду. Свежая приготовленная еда дает больше HP и не уменьшает
                    самоконтроль, если в ней нет человечины.
                </li>
                <li><b>Кровать</b>: тролль во сне восстанавливает больше здоровья</li>
                <li><b>Украшения для моста</b>: по украшенному мосту иногда будет проезжать Король.</li>
            </ul>

            <h2>Условия победы</h2>
            Ограбить отряд Короля!
        </div>
    </MenuTemplate>
}